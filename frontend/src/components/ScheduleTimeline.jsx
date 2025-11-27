/**
 * Schedule Timeline Component
 * Vertical scrollable timeline showing daily bookings
 */

import { useEffect, useState } from 'react';
import { timeToSlotIndex, slotIndexToTime, SLOT_INTERVAL_MINUTES, START_HOUR, END_HOUR, SLOT_COUNT, mergeAdjacentSlots } from '../utils/timelineHelpers';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

function todayISO() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function ScheduleTimeline() {
  const [date, setDate] = useState(todayISO());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  // Fetch bookings from API
  const fetchBookings = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setError('未认证，请重新登录。');
      setBookings([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const query = date ? `?date=${encodeURIComponent(date)}` : '';
      const response = await fetch(`${API_BASE_URL}/admin/bookings${query}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        setError('认证失败，请重新登录。');
        setBookings([]);
        return;
      }

      if (!response.ok) {
        throw new Error(`加载预订失败 (HTTP ${response.status})`);
      }

      const data = await response.json();
      setBookings(data.bookings || []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  // Build timeline slots
  const buildTimelineSlots = () => {
    const slots = [];

    // Create slots (8:00-20:00, 30-minute intervals)
    for (let i = 0; i < SLOT_COUNT; i++) {
      const startTime = slotIndexToTime(i);
      const endTime = slotIndexToTime(i + 1);

      slots.push({
        index: i,
        startTime,
        endTime,
        status: 'available',
        bookingInfoList: []
      });
    }

    // Mark booked slots
    bookings.forEach((booking) => {
      const startIndex = timeToSlotIndex(booking.time);
      if (startIndex < 0) return;

      const duration = Number(booking.duration) || 60;
      const slotsNeeded = Math.ceil(duration / SLOT_INTERVAL_MINUTES);

      const bookingBlock = {
        bookingId: booking.id,
        serviceName: booking.serviceName,
        duration: booking.duration,
        price: booking.price,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        time: booking.time,
        date: booking.date,
        startIndex,
        endIndex: startIndex + slotsNeeded
      };

      for (let i = startIndex; i < startIndex + slotsNeeded && i < SLOT_COUNT; i++) {
        slots[i].status = 'booked';
        slots[i].bookingInfoList.push(bookingBlock);
      }
    });

    return slots;
  };

  // Build individual slots (no merging for grid layout)
  const slots = buildTimelineSlots();

  // Group overlapping bookings into lanes for horizontal display
  const assignLanesToBookings = () => {
    const lanes = [];
    const bookingsWithLanes = [];

    bookings.forEach((booking) => {
      const startIndex = timeToSlotIndex(booking.time);
      if (startIndex < 0) return;

      const duration = Number(booking.duration) || 60;
      const slotsNeeded = Math.ceil(duration / SLOT_INTERVAL_MINUTES);
      const endIndex = startIndex + slotsNeeded;

      // Find available lane
      let assignedLane = -1;
      for (let i = 0; i < lanes.length; i++) {
        const lane = lanes[i];
        // Check if this lane is free for this time range
        const hasConflict = lane.some(
          (b) => !(endIndex <= b.startIndex || startIndex >= b.endIndex)
        );
        if (!hasConflict) {
          assignedLane = i;
          break;
        }
      }

      // If no available lane, create new one
      if (assignedLane === -1) {
        assignedLane = lanes.length;
        lanes.push([]);
      }

      const bookingWithLane = {
        ...booking,
        startIndex,
        endIndex,
        lane: assignedLane,
        slotsSpan: slotsNeeded
      };

      lanes[assignedLane].push(bookingWithLane);
      bookingsWithLanes.push(bookingWithLane);
    });

    return { bookingsWithLanes, laneCount: lanes.length };
  };

  const { bookingsWithLanes, laneCount } = assignLanesToBookings();

  // Calculate dynamic slot heights - expand only when ALL bookings in slot are 30-min
  const calculateSlotHeights = () => {
    return slots.map((slot, idx) => {
      // Get all bookings starting at this slot
      const bookingsAtThisSlot = bookingsWithLanes.filter(
        (b) => b.startIndex === idx
      );

      if (bookingsAtThisSlot.length === 0) {
        return '60px'; // No bookings, normal height
      }

      // Only expand if ALL bookings at this slot are 30-minute
      const allAre30Min = bookingsAtThisSlot.every((b) => b.slotsSpan === 1);

      return allAre30Min ? '85px' : '60px';
    });
  };

  const slotHeights = calculateSlotHeights();

  // Find merged available time ranges
  const findAvailableRanges = () => {
    const ranges = [];
    let rangeStart = null;

    for (let i = 0; i < SLOT_COUNT; i++) {
      const hasBooking = bookingsWithLanes.some(
        (b) => i >= b.startIndex && i < b.endIndex
      );

      if (!hasBooking) {
        // This slot is available
        if (rangeStart === null) {
          rangeStart = i;
        }
      } else {
        // This slot is booked
        if (rangeStart !== null) {
          // Close the previous available range
          ranges.push({
            startIndex: rangeStart,
            endIndex: i,
            startTime: slotIndexToTime(rangeStart),
            endTime: slotIndexToTime(i)
          });
          rangeStart = null;
        }
      }
    }

    // Close any remaining range at the end
    if (rangeStart !== null) {
      ranges.push({
        startIndex: rangeStart,
        endIndex: SLOT_COUNT,
        startTime: slotIndexToTime(rangeStart),
        endTime: slotIndexToTime(SLOT_COUNT)
      });
    }

    return ranges;
  };

  const availableRanges = findAvailableRanges();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">时间轴</h2>
          <p className="text-gray-600">{date}</p>
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-1">最后更新: {lastUpdated}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <label className="text-sm text-gray-700">
            <span className="block mb-1">选择日期</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <button
            type="button"
            onClick={fetchBookings}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors self-end"
          >
            🔄 刷新
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded border-l-4 border-green-500 bg-green-50" />
          <span>空闲</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded border-l-4 border-red-500 bg-red-50" />
          <span>已预订</span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          <span className="ml-3 text-gray-700">加载中...</span>
        </div>
      ) : (
        /* Timeline Display - CSS Grid Layout */
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div
            className="grid gap-0"
            style={{
              gridTemplateColumns: `160px repeat(${Math.max(laneCount, 1)}, 1fr)`,
              gridTemplateRows: `auto ${slotHeights.join(' ')}`
            }}
          >
            {/* Header Row */}
            <div className="bg-gray-50 px-6 py-4 border-b-2 border-gray-200 font-semibold text-sm text-gray-700 uppercase flex items-center">
              时间
            </div>
            <div
              className="bg-gray-50 px-6 py-4 border-b-2 border-gray-200 font-semibold text-sm text-gray-700 uppercase flex items-center"
              style={{ gridColumn: `2 / ${Math.max(laneCount, 1) + 2}` }}
            >
              预订
            </div>

            {/* Time labels column - positioned on border line */}
            {slots.map((slot, idx) => (
              <div
                key={`time-${idx}`}
                className="px-6 border-b border-gray-200 flex items-center text-base font-semibold text-gray-900 bg-gray-50 relative"
                style={{ gridRow: idx + 2, gridColumn: 1 }}
              >
                <span
                  className="inline-block bg-gray-50 pr-2 relative"
                  style={{
                    transform: 'translateY(-50%)',
                    top: '-1px'
                  }}
                >
                  {slot.startTime}
                </span>
              </div>
            ))}

            {/* Booking cards - positioned by grid-row with 2-row compact layout */}
            {bookingsWithLanes.map((booking, idx) => (
              <div
                key={`booking-${booking.id || idx}`}
                className="bg-white border-2 border-red-300 rounded-lg p-3 shadow-md m-1 overflow-hidden"
                style={{
                  gridRow: `${booking.startIndex + 2} / ${booking.endIndex + 2}`,
                  gridColumn: booking.lane + 2,
                  backgroundColor: '#fef2f2',
                  minHeight: '80px'
                }}
              >
                {/* Row 1: Customer Name (left) | Phone (right) */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-base text-gray-900">
                    {booking.customerName}
                  </span>
                  <span className="font-medium text-sm text-gray-700">
                    {booking.customerPhone}
                  </span>
                </div>

                {/* Row 2: Service & Price (left) | Time & Duration (right) */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="font-semibold text-sm text-gray-900 truncate">
                      {booking.serviceName}
                    </span>
                    <span className="font-bold text-sm text-red-700 flex-shrink-0">
                      ${Number(booking.price).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700 flex-shrink-0">
                    <span className="font-medium">{booking.time}</span>
                    <span className="text-gray-400">·</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold whitespace-nowrap">
                      {booking.duration}min
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Merged available time ranges - compact display */}
            {availableRanges.map((range, idx) => (
              <div
                key={`available-${idx}`}
                className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-400 rounded-lg m-1 flex items-center justify-center shadow-sm"
                style={{
                  gridRow: `${range.startIndex + 2} / ${range.endIndex + 2}`,
                  gridColumn: `2 / ${Math.max(laneCount, 1) + 2}`,
                  minHeight: '60px'
                }}
              >
                <div className="flex items-center gap-3 px-4">
                  <span className="text-3xl">✅</span>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-800">空闲</div>
                    <div className="text-base font-semibold text-green-700">
                      {range.startTime} - {range.endTime}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ScheduleTimeline;
