import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { QRCodeSVG } from "qrcode.react";
import { addBooking, cancelBooking } from "../store/bookingsSlice";

const CANCEL_WINDOW_MS = 48 * 60 * 60 * 1000; // 48 hours

function Event() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const eventList = useSelector((state) => state.event.list);
  const bookingsList = useSelector((state) => state.bookings.list);
  const authStatus = useSelector((state) => state.auth.status);
  const userData = useSelector((state) => state.auth.userData);

  const [event, setEvent] = useState(null);

  useEffect(() => {
    const selectedEvent = eventList.find((item) => item.id === Number(id));

    setEvent(selectedEvent);
  }, [id, eventList]);

  // An "active" booking is one that hasn't been cancelled - used both to
  // block a second registration and to show the QR code again on revisit
  // (instead of only right after clicking Register).
  const existingBooking = bookingsList.find(
    (b) =>
      b.eventId === Number(id) &&
      b.userEmail === userData?.email &&
      b.status !== "Cancelled",
  );

  const canCancel =
    existingBooking &&
    Date.now() - new Date(existingBooking.bookedAt).getTime() <
      CANCEL_WINDOW_MS;

  const handleRegister = () => {
    if (!authStatus) {
      navigate("/login");
      return;
    }

    if (existingBooking) {
      // Guard against double-registration even if the button were somehow
      // clicked again (e.g. stale UI) - one active booking per user/event.
      return;
    }

    const newBooking = {
      ticketId: `TCKT-${Date.now()}`,
      eventId: event.id,
      eventTitle: event.title,
      eventImage: event.image,
      eventDate: event.date,
      eventLocation: event.location,
      userEmail: userData?.email,
      userName: userData?.name,
      bookedAt: new Date().toISOString(),
      status: "Confirmed",
    };

    dispatch(addBooking(newBooking));
  };

  const handleCancel = () => {
    if (!existingBooking) return;
    dispatch(cancelBooking(existingBooking.ticketId));
  };

  if (!event) {
    return (
      <div className="h-screen flex justify-center items-center text-white">
        Event Not Found
      </div>
    );
  }

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
            <p className="mt-3 px-2 text-gray-400">Hosted by {event.host}</p>

            <div className="flex flex-wrap gap-3 mt-6">
              <span className="px-4 py-2 rounded-lg bg-violet-900 font-semibold text-sm uppercase">
                {event.category}
              </span>

              <span className="px-4 py-2 rounded-lg bg-gray-800 font-semibold text-sm uppercase">
                {event.mode}
              </span>
              {event.tags?.slice(0, 2).map((tag) => (
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
                <h3>{event.start}</h3>
              </div>

              <div className="bg-slate-900 rounded-xl p-5">
                <p className="text-gray-400">Ends</p>
                <h3>{event.end}</h3>
              </div>

              <div className="bg-slate-900 rounded-xl p-5">
                <p className="text-gray-400">Location</p>
                <h3>{event.location}</h3>
              </div>

              <div className="bg-slate-900 rounded-xl p-5">
                <p className="text-gray-400">Registered</p>
                <h3>{event.attendees} Attendees</h3>
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-semibold mb-4">About Event</h2>

              <p className="text-gray-300 leading-8">{event.description}</p>
            </div>
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
                      {event.attendees}/{event.slots} Registered
                    </p>
                  </div>

                  <h3 className="text-blue-500">{event.price}</h3>
                </div>
              </div>

              {existingBooking ? (
                <div className="mt-6 bg-slate-800 rounded-xl p-5 text-center">
                  <p className="text-green-400 font-semibold mb-4">
                    You're registered!
                  </p>

                  <div className="bg-white rounded-lg p-4 inline-block">
                    <QRCodeSVG
                      value={JSON.stringify({
                        ticketId: existingBooking.ticketId,
                        eventId: existingBooking.eventId,
                      })}
                      size={160}
                    />
                  </div>

                  <p className="text-gray-400 text-sm mt-4">
                    Ticket ID: {existingBooking.ticketId}
                  </p>

                  <Link
                    to="/mybookings"
                    className="block w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl mt-5"
                  >
                    View in My Bookings
                  </Link>

                  {canCancel ? (
                    <button
                      onClick={handleCancel}
                      className="w-full border border-red-600 text-red-400 hover:bg-red-600 hover:text-white transition py-3 rounded-xl mt-3"
                    >
                      Cancel Booking
                    </button>
                  ) : (
                    <p className="text-gray-500 text-xs mt-3">
                      Cancellation window (48 hours after booking) has
                      passed.
                    </p>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl mt-6"
                >
                  Register Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Event;
