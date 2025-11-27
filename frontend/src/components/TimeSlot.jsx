function formatPrice(price) {
  const value = Number(price);
  if (Number.isNaN(value)) return '';
  return `$${value.toFixed(2)}`;
}

function TimeSlot({ slot, onClick }) {
  const isBooked = slot.status === 'booked' && slot.bookingInfoList?.length;
  const containerClasses = isBooked
    ? 'slot-booked bg-red-50 border-l-4 border-red-500 rounded-md'
    : 'slot-available bg-green-50 border-l-4 border-green-500 rounded-md';

  const bookings = slot.bookingInfoList || [];
  // For merged booked blocks with single bookingInfo, prefer its overall start/end
  const titleRange = (() => {
    if (isBooked && bookings.length === 1 && bookings[0].startIndex !== undefined && bookings[0].endIndex !== undefined) {
      return `${slot.startTime} - ${slot.endTime}`;
    }
    return `${slot.startTime} - ${slot.endTime}`;
  })();

  const pastClass = slot.isPast ? 'opacity-60' : '';
  const nowClass = slot.isNow ? 'ring-2 ring-blue-500 ring-offset-1' : '';

  return (
    <div
      className={`grid grid-cols-[80px_1fr] gap-3 p-3 mb-2 ${containerClasses} ${isBooked ? 'hover:bg-red-100 transition-colors' : ''} ${pastClass} ${nowClass}`}
      onClick={isBooked ? onClick : undefined}
      role="row"
      aria-label={isBooked ? `Booked ${titleRange}` : `Available ${titleRange}`}
    >
      <div className="time-label text-sm font-semibold text-gray-700" role="gridcell">
        {titleRange}
      </div>
      <div role="gridcell" className="text-sm text-gray-800 space-y-1">
        {isBooked ? (
          <div
            className="space-y-3"
            style={
              bookings.length > 1
                ? {
                    display: 'grid',
                    gap: '0.5rem',
                    gridTemplateColumns: `repeat(${Math.min(bookings.length, 3)}, minmax(0, 1fr))`
                  }
                : undefined
            }
          >
            {bookings.map((info, idx) => (
              <div key={`${info.bookingId}-${idx}`} className="border-b border-red-100 last:border-0 pb-2 last:pb-0">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                    <span aria-hidden>💆</span>
                    {info.serviceName}
                  </div>
                  <div className="font-semibold text-gray-900">{formatPrice(info.price)}</div>
                </div>
                <div className="flex items-center gap-2 text-gray-800">
                  <span aria-hidden>👤</span>
                  <span>{info.customerName}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span aria-hidden>☎️</span>
                  <span>{info.customerPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 break-all">
                  <span aria-hidden>✉️</span>
                  <span>{info.customerEmail}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-700">✔️ Available</div>
        )}
      </div>
    </div>
  );
}

export default TimeSlot;
