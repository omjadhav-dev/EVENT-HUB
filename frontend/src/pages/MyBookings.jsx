import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { getMyBookings, cancelBooking as cancelBookingApi } from "../api/registration.api";
import { setBookings, updateBooking } from "../store/bookingsSlice";
import { useToast } from "../context/useToast";
import ConfirmModal from "../components/ConfirmModal";

// Matches the backend's CANCELLATION_CUTOFF_HOURS - bookings can't be
// cancelled within 24 hours of the event's start time.
const CANCELLATION_CUTOFF_HOURS = 24;

function MyBookings() {
  const authStatus = useSelector((state) => state.auth.status);
  const bookings = useSelector((state) => state.bookings.list);
  const dispatch = useDispatch();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!authStatus) return;
    getMyBookings()
      .then((res) => dispatch(setBookings(res.data)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authStatus, dispatch]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelBookingApi(cancelTarget._id);
      dispatch(updateBooking({ _id: cancelTarget._id, updates: { status: "Cancelled" } }));
      toast.info("Your booking has been cancelled.");
      setCancelTarget(null);
    } catch (err) {
      toast.error(err.message || "Something went wrong while cancelling this booking.");
    } finally {
      setCancelling(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white">
        Loading...
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

      {bookings.length === 0 ? (
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
          {bookings.map((booking) => {
            const event = booking.eventId;
            const isCancelled = booking.status === "Cancelled";

            const hoursUntilEvent = event
              ? (new Date(event.start) - new Date()) / (1000 * 60 * 60)
              : 0;
            const canCancel = !isCancelled && hoursUntilEvent >= CANCELLATION_CUTOFF_HOURS;

            return (
              <div
                key={booking._id}
                className={`border rounded-2xl bg-[#13131b] p-8 flex gap-6 ${
                  isCancelled ? "border-gray-800 opacity-60" : "border-gray-700"
                }`}
              >
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold">
                      {event?.title}
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
                      {event && new Date(event.start).toLocaleDateString(undefined, {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin size={18} />
                      {event?.mode === "Offline" ? `${event.venue}, ${event.city}` : event?.mode}
                    </div>
                  </div>

                  <p className="text-gray-500 text-sm mt-6 break-all">
                    Ticket ID: {booking.qrCode}
                  </p>

                  {booking.checkedIn && (
                    <p className="text-green-400 text-sm mt-2 font-semibold">
                      Checked in at the venue
                    </p>
                  )}

                  <div className="flex items-center gap-5 mt-4">
                    <Link
                      to={`/event/${event?._id}`}
                      className="text-violet-400 hover:text-violet-300 text-sm font-semibold"
                    >
                      View event
                    </Link>

                    {canCancel && (
                      <button
                        onClick={() => setCancelTarget(booking)}
                        className="text-red-400 hover:text-red-300 text-sm font-semibold cursor-pointer"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>

                  {!isCancelled && !canCancel && (
                    <p className="text-gray-600 text-xs mt-3">
                      Cancellation window ({CANCELLATION_CUTOFF_HOURS} hours before the event starts)
                      has passed.
                    </p>
                  )}
                </div>

                <div
                  className={`bg-white rounded-xl p-3 h-fit ${
                    isCancelled ? "grayscale" : ""
                  }`}
                >
                  <QRCodeSVG value={booking.qrCode} size={120} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {cancelTarget && (
        <ConfirmModal
          title="Cancel this booking?"
          message={`Your ticket for "${cancelTarget.eventId?.title || "this event"}" will no longer be valid.`}
          confirmLabel="Yes, cancel it"
          cancelLabel="Keep my booking"
          loading={cancelling}
          onConfirm={handleCancel}
          onCancel={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}

export default MyBookings;
