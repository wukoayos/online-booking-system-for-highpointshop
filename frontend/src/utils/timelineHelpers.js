export const START_HOUR = 8; // 08:00
export const END_HOUR = 20; // 20:00
export const SLOT_INTERVAL_MINUTES = 30; // 30-minute granularity
export const SLOTS_PER_HOUR = 60 / SLOT_INTERVAL_MINUTES;
export const SLOT_COUNT = (END_HOUR - START_HOUR) * SLOTS_PER_HOUR;

const pad = (n) => String(n).padStart(2, '0');

export function timeToSlotIndex(time) {
  if (!time || typeof time !== 'string') return -1;
  const [hoursStr, minutesStr] = time.split(':');
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return -1;
  const offsetHours = hours - START_HOUR;
  const slotIndex = offsetHours * SLOTS_PER_HOUR + Math.floor(minutes / SLOT_INTERVAL_MINUTES);

  return slotIndex >= 0 && slotIndex < SLOT_COUNT ? slotIndex : -1;
}

export function slotIndexToTime(index) {
  const totalMinutes = START_HOUR * 60 + index * SLOT_INTERVAL_MINUTES;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${pad(hours)}:${pad(minutes)}`;
}

function buildBaseSlots() {
  return Array.from({ length: SLOT_COUNT }, (_v, i) => {
    const startTime = slotIndexToTime(i);
    const endTime = slotIndexToTime(i + 1);
    return {
      startTime,
      endTime,
      status: 'available',
      bookingInfoList: []
    };
  });
}

export function transformBookingsToSlots(bookings = [], dateFilter) {
  const slots = buildBaseSlots();

  bookings.forEach((booking) => {
    if (dateFilter && booking.date !== dateFilter) return;

    const startIndex = timeToSlotIndex(booking.time);
    if (startIndex < 0) return;

    const duration = Number(booking.duration) || 60;
    const slotsNeeded = Math.max(1, Math.ceil(duration / SLOT_INTERVAL_MINUTES));
    const endIndex = startIndex + slotsNeeded;

    // A block for the full duration, displayed once
    const block = {
      bookingId: booking.id,
      serviceName: booking.serviceName,
      duration: booking.duration,
      price: booking.price,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      createdAt: booking.createdAt,
      time: booking.time,
      date: booking.date,
      startIndex,
      endIndex
    };

    for (let i = startIndex; i < endIndex && i < SLOT_COUNT; i += 1) {
      slots[i] = {
        ...slots[i],
        status: 'booked',
        bookingInfoList: [...slots[i].bookingInfoList, block]
      };
    }
  });

  return slots;
}

export function mergeAdjacentSlots(slots) {
  if (!Array.isArray(slots) || slots.length === 0) return [];
  const merged = [];

  for (let i = 0; i < slots.length; i += 1) {
    const current = slots[i];
    const last = merged[merged.length - 1];

    if (
      last &&
      last.status === current.status &&
      (
        (last.status === 'booked' &&
          current.status === 'booked' &&
          last.bookingInfoList?.length === 1 &&
          current.bookingInfoList?.length === 1 &&
          last.bookingInfoList[0]?.bookingId === current.bookingInfoList[0]?.bookingId) ||
        (last.status === 'available' && current.status === 'available')
      )
    ) {
      // Extend previous block (booked by same booking or both available)
      last.endTime = current.endTime;
      continue;
    }

    merged.push({ ...current });
  }

  return merged;
}
