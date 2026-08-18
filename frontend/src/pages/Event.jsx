import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { QRCodeSVG } from "qrcode.react";
import { getEventById } from "../api/event.api";
import { bookEvent, cancelBooking as cancelBookingApi, getMyBookings } from "../api/registration.api";
import { addBooking, setBookings, updateBooking } from "../store/bookingsSlice";
import { useToast } from "../context/useToast";
import EventChat from "../components/EventChat";
import ConfirmModal from "../components/ConfirmModal";

// Matches the backend's CANCELLATION_CUTOFF_HOURS in
// registration.controllers.js - bookings can't be cancelled within 24
// hours of the event's start time.
const CANCELLATION_CUTOFF_HOURS = 24;

function Event() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const bookingsList = useSelector((state) => state.bookings.list);
  const authStatus = useSelector((state) => state.auth.status);
  const userData = useSelector((state) => state.auth.userData);
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  useEffect(() => {
    getEventById(id)
      .then((res) => setEvent(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  // Bookings are only fetched here (rather than globally) because this is
  // the one page that needs to know "do I already have a ticket for this
  // specific event" - MyBookings.jsx fetches its own full list separately.
  useEffect(() => {
    if (!authStatus) return;
    getMyBookings()
      .then((res) => dispatch(setBookings(res.data)))
      .catch(() => {});
  }, [authStatus, dispatch]);

  const existingBooking = bookingsList.find(
    (b) => b.eventId?._id === id && b.status !== "Cancelled",
  );

  const hoursUntilEvent = event
    ? (new Date(event.start) - new Date()) / (1000 * 60 * 60)
    : 0;
  const canCancel = existingBooking && hoursUntilEvent >= CANCELLATION_CUTOFF_HOURS;

  const handleRegister = async () => {
    if (!authStatus) {
      navigate("/login");
      return;
    }
    if (existingBooking || submitting) return;

    setSubmitting(true);
    try {
      const res = await bookEvent(id);
      dispatch(addBooking(res.data));
      // Reflect the new registration count immediately without a refetch.
      setEvent((prev) => prev && { ...prev, registrationCount: prev.registrationCount + 1 });
      toast.success("Your ticket is ready - QR code is right here.", { title: "You're in!" });
    } catch (err) {
      toast.error(err.message || "Something went wrong while booking this event.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!existingBooking || submitting) return;

    setSubmitting(true);
    try {
      await cancelBookingApi(existingBooking._id);
      dispatch(updateBooking({ _id: existingBooking._id, updates: { status: "Cancelled" } }));
      setEvent((prev) => prev && { ...prev, registrationCount: Math.max(0, prev.registrationCount - 1) });
      toast.info("Your booking has been cancelled.");
    } catch (err) {
      toast.error(err.message || "Something went wrong while cancelling this booking.");
    } finally {
      setSubmitting(false);
      setConfirmingCancel(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center text-white">
        Loading...
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="h-screen flex justify-center items-center text-white">
        Event Not Found
      </div>
    );
  }

  const priceLabel = event.ticketType === "Paid" ? `\u20B9${event.ticketPrice}` : "Free";
  const isFull = event.registrationCount >= event.capacity;

  return (
    <div className="min-h-screen bg-slate-950 text-white py-24">
      {/* Hero */}

      <div className="max-w-7xl mx-auto px-6">
        <div className="relative h-[400px] rounded-3xl overflow-hidden">
          <img
            src={event.image}
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/30"></div>

          <div className="absolute bottom-10 left-10">
            <h1 className="text-6xl  font-sans font-bold">{event.title}</h1>
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-8 mt-5">
          {/* Left */}

          <div className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <p className="mt-3 px-2 text-gray-400">Hosted by {event.organizerId?.name}</p>

              {userData?._id === event.organizerId?._id && (
                <Link
                  to={`/myevents/${event._id}/edit`}
                  className="text-violet-400 hover:text-violet-300 text-sm font-semibold"
                >
                  Edit Event
                </Link>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <span className="px-4 py-2 rounded-lg bg-violet-900 font-semibold text-sm uppercase">
                {event.category}
              </span>

              <span className="px-4 py-2 rounded-lg bg-gray-800 font-semibold text-sm uppercase">
                {event.mode}
              </span>
              {event.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 rounded-full border border-violet-700 text-white bg-violet-950/30 text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-5 mt-10">
              <div className="bg-slate-900 rounded-xl p-5">
                <p className="text-gray-400">Starts</p>
                <h3>{new Date(event.start).toLocaleString()}</h3>
              </div>

              <div className="bg-slate-900 rounded-xl p-5">
                <p className="text-gray-400">Ends</p>
                <h3>{new Date(event.end).toLocaleString()}</h3>
              </div>

              <div className="bg-slate-900 rounded-xl p-5">
                <p className="text-gray-400">Location</p>
                {event.mode === "Offline" ? (
                  <h3>{event.venue}, {event.city}</h3>
                ) : existingBooking ? (
                  <a
                    href={event.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-400 hover:text-violet-300 underline break-all"
                  >
                    Join Meeting Link
                  </a>
                ) : (
                  <h3>
                    Online{" "}
                    <span className="text-gray-500 text-sm">
                      (link shared after registration)
                    </span>
                  </h3>
                )}
              </div>

              <div className="bg-slate-900 rounded-xl p-5">
                <p className="text-gray-400">Registered</p>
                <h3>{event.registrationCount} Attendees</h3>
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-semibold mb-4">About Event</h2>

              <p className="text-gray-300 leading-8">{event.description}</p>
            </div>

            <EventChat eventId={id} eventTitle={event.title} />
          </div>

          {/* Right */}

          <div>
            <div className="bg-slate-900 rounded-2xl p-6 sticky top-28 mt-10">
              <h2 className="text-2xl font-bold">Choose Ticket</h2>

              <p className="text-gray-400 mt-2">1 Tier Available</p>

              <div className="bg-slate-800 rounded-xl p-5 mt-6">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">General</h3>

                    <p className="text-gray-400">
                      {event.registrationCount}/{event.capacity} Registered
                    </p>
                  </div>

                  <h3 className="text-blue-500">{priceLabel}</h3>
                </div>
              </div>

              {existingBooking ? (
                <div className="mt-6 bg-slate-800 rounded-xl p-5 text-center">
                  <p className="text-green-400 font-semibold mb-4">
                    You're registered!
                  </p>

                  <div className="bg-white rounded-lg p-4 inline-block">
                    <QRCodeSVG value={existingBooking.qrCode} size={160} />
                  </div>

                  <p className="text-gray-400 text-sm mt-4 break-all">
                    Ticket ID: {existingBooking.qrCode}
                  </p>

                  <Link
                    to="/mybookings"
                    className="block w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl mt-5"
                  >
                    View in My Bookings
                  </Link>

                  {canCancel ? (
                    <button
                      onClick={() => setConfirmingCancel(true)}
                      disabled={submitting}
                      className="w-full border border-red-600 text-red-400 hover:bg-red-600 hover:text-white transition py-3 rounded-xl mt-3 disabled:opacity-50"
                    >
                      Cancel Booking
                    </button>
                  ) : (
                    <p className="text-gray-500 text-xs mt-3">
                      Cancellation window ({CANCELLATION_CUTOFF_HOURS} hours before the event starts)
                      has passed.
                    </p>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={submitting || isFull}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFull ? "Fully Booked" : submitting ? "Registering..." : "Register Now"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {confirmingCancel && (
        <ConfirmModal
          title="Cancel this booking?"
          message="Your ticket and QR code will no longer be valid. You can register again later if there's space."
          confirmLabel="Yes, cancel it"
          cancelLabel="Keep my booking"
          loading={submitting}
          onConfirm={handleCancel}
          onCancel={() => setConfirmingCancel(false)}
        />
      )}
    </div>
  );
}

export default Event;
