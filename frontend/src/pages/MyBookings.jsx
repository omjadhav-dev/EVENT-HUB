import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { cancelBooking } from "../store/bookingsSlice";

const CANCEL_WINDOW_MS = 48 * 60 * 60 * 1000; // 48 hours

function MyBookings() {
  const authStatus = useSelector((state) => state.auth.status);
  const userData = useSelector((state) => state.auth.userData);
  const bookings = useSelector((state) => state.bookings.list);
  const dispatch = useDispatch();

  const myBookings = bookings.filter(
    (booking) => booking.userEmail === userData?.email,
  );

  if (!authStatus) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4">
        <p className="text-gray-400">Log in to see your bookings.</p>
        <Link
          to="/login"
          className="bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl font-semibold"
        >
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white px-12 py-10">
      {/* Heading */}
      <div className="mt-20 mb-10">
        <p className="text-violet-500 uppercase tracking-widest text-sm">
          Attendee
        </p>

        <h1 className="text-6xl font-bold mt-2">My bookings</h1>
      </div>

      {myBookings.length === 0 ? (
        <div className="border border-gray-700 rounded-2xl p-10 bg-[#13131b] text-center">
          <Ticket className="text-violet-500 mx-auto mb-4" size={32} />

          <p className="text-gray-400">
            You haven't registered for any events yet.
          </p>

          <Link
            to="/explore"
            className="inline-block mt-6 bg-violet-600 hover:bg-violet-500 px-5 py-3 rounded-xl font-semibold"
          >
            Explore events
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {myBookings.map((booking) => {
            const isCancelled = booking.status === "Cancelled";

            const canCancel =
              !isCancelled &&
              Date.now() - new Date(booking.bookedAt).getTime() <
                CANCEL_WINDOW_MS;

            return (
              <div
                key={booking.ticketId}
                className={`border rounded-2xl bg-[#13131b] p-8 flex gap-6 ${
                  isCancelled ? "border-gray-800 opacity-60" : "border-gray-700"
                }`}
              >
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold">
                      {booking.eventTitle}
                    </h2>

                    <span
                      className={`px-4 py-1 rounded-lg text-xs tracking-widest ${
                        isCancelled
                          ? "bg-red-950 text-red-400"
                          : "bg-violet-900 text-violet-300"
                      }`}
                    >
                      {booking.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 text-gray-400 mt-5">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={18} />
                      {booking.eventDate}
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin size={18} />
                      {booking.eventLocation}
                    </div>
                  </div>

                  <p className="text-gray-500 text-sm mt-6">
                    Ticket ID: {booking.ticketId}
                  </p>

                  {booking.checkedIn && (
                    <p className="text-green-400 text-sm mt-2 font-semibold">
                      Checked in at the venue
                    </p>
                  )}

                  <div className="flex items-center gap-5 mt-4">
                    <Link
                      to={`/event/${booking.eventId}`}
                      className="text-violet-400 hover:text-violet-300 text-sm font-semibold"
                    >
                      View event
                    </Link>

                    {canCancel && (
                      <button
                        onClick={() => dispatch(cancelBooking(booking.ticketId))}
                        className="text-red-400 hover:text-red-300 text-sm font-semibold cursor-pointer"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>

                  {!isCancelled && !canCancel && (
                    <p className="text-gray-600 text-xs mt-3">
                      Cancellation window (48 hours after booking) has
                      passed.
                    </p>
                  )}
                </div>

                <div
                  className={`bg-white rounded-xl p-3 h-fit ${
                    isCancelled ? "grayscale" : ""
                  }`}
                >
                  <QRCodeSVG
                    value={JSON.stringify({
                      ticketId: booking.ticketId,
                      eventId: booking.eventId,
                    })}
                    size={120}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyBookings;
