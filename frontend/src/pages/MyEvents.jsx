import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { CalendarDays, Users, QrCode, Eye, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { checkInBooking } from "../store/bookingsSlice";

function MyEvents() {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.userData);
  const eventList = useSelector((state) => state.event.list);
  const bookingsList = useSelector((state) => state.bookings.list);

  // "all" shows every registration, "pending" shows only the ones not
  // checked in yet - toggled by the View button below.
  const [regFilter, setRegFilter] = useState("all");

  // Only the events this organizer actually published - matched by the
  // organizerEmail stamped on the event when it was created in Create.jsx.
  const myEvents = eventList.filter(
    (event) => event.organizerEmail === userData?.email,
  );

  const myEventIds = myEvents.map((event) => event.id);

  // Every confirmed booking made against any of this organizer's events.
  const myRegistrations = bookingsList.filter(
    (booking) =>
      myEventIds.includes(booking.eventId) && booking.status !== "Cancelled",
  );

  const pendingRegistrations = myRegistrations.filter(
    (booking) => !booking.checkedIn,
  );

  const visibleRegistrations =
    regFilter === "pending" ? pendingRegistrations : myRegistrations;

  const handleBulkCheckIn = () => {
    if (pendingRegistrations.length === 0) return;
    pendingRegistrations.forEach((booking) =>
      dispatch(checkInBooking(booking.ticketId)),
    );
  };

  const totalEvents = myEvents.length;
  const totalRegistrations = myRegistrations.length;
  const readyToCheckIn = pendingRegistrations.length;

  if (!userData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4">
        <p className="text-gray-400">Log in as an organizer to see your events.</p>
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
      <div className="flex justify-between items-center mb-10">
        <div className="mt-20">
          <p className="text-violet-500 uppercase tracking-widest text-sm">
            Organizer
          </p>

          <h1 className="text-6xl font-bold mt-2">Your events</h1>
        </div>
        <Link to="/create">
          <button className="flex cursor-pointer items-center gap-3 bg-violet-600 hover:bg-violet-500 px-5 py-4 rounded-full font-semibold">
            <Plus size={20} />
            Create Event
          </button>
        </Link>
      </div>

      {/* Stats */}

      <div className="grid grid-cols-3 gap-6 mb-12">
        <div className="border border-gray-700 rounded-2xl p-6 bg-[#13131b]">
          <CalendarDays className="text-violet-500 mb-4" size={28} />

          <h2 className="text-5xl font-bold">{totalEvents}</h2>

          <p className="uppercase tracking-widest text-gray-400 mt-2 text-sm">
            Total Events
          </p>
        </div>

        <div className="border border-gray-700 rounded-2xl p-6 bg-[#13131b]">
          <Users className="text-violet-500 mb-4" size={28} />

          <h2 className="text-5xl font-bold">{totalRegistrations}</h2>

          <p className="uppercase tracking-widest text-gray-400 mt-2 text-sm">
            Total Registrations
          </p>
        </div>

        <div className="border border-gray-700 rounded-2xl p-6 bg-[#13131b]">
          <QrCode className="text-violet-500 mb-4" size={28} />

          <h2 className="text-5xl font-bold">{readyToCheckIn}</h2>

          <p className="uppercase tracking-widest text-gray-400 mt-2 text-sm">
            Ready To Check-in
          </p>
        </div>
      </div>

      {/* Bottom Section */}

      {totalEvents === 0 ? (
        <div className="border border-gray-700 rounded-2xl p-10 bg-[#13131b] text-center">
          <CalendarDays className="text-violet-500 mx-auto mb-4" size={32} />

          <p className="text-gray-400">
            You haven't published any events yet.
          </p>

          <Link
            to="/create"
            className="inline-block mt-6 bg-violet-600 hover:bg-violet-500 px-5 py-3 rounded-xl font-semibold"
          >
            Create your first event
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-8">
          {/* Event Cards */}

          <div className="space-y-6">
            {myEvents.map((event) => {
              const regsForThisEvent = bookingsList.filter(
                (booking) =>
                  booking.eventId === event.id &&
                  booking.status !== "Cancelled",
              ).length;

              return (
                <Link key={event.id} to={`/event/${event.id}`}>
                  <div className="border border-violet-500 rounded-2xl bg-[#13131b] p-8 hover:border-violet-400 transition">
                    <div className="flex justify-between items-center">
                      <h2 className="text-3xl font-bold">{event.title}</h2>

                      <span className="bg-violet-900 text-violet-300 px-4 py-1 rounded-lg text-xs tracking-widest">
                        PUBLISHED
                      </span>
                    </div>

                    <div className="flex gap-6 text-gray-400 mt-5">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={18} />
                        {event.date}
                      </div>

                      <div className="flex items-center gap-2">
                        <Users size={18} />
                        {regsForThisEvent} regs
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Registrations */}

          <div className="border border-gray-700 rounded-2xl bg-[#13131b] p-8 h-fit">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Registrations</h2>

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setRegFilter((f) => (f === "all" ? "pending" : "all"))
                  }
                  className="flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-xl hover:bg-gray-800 cursor-pointer"
                >
                  <Eye size={18} />
                  {regFilter === "all" ? "View Pending" : "View All"}
                </button>

                <button
                  onClick={handleBulkCheckIn}
                  disabled={pendingRegistrations.length === 0}
                  className="flex items-center gap-2 bg-violet-600 px-5 py-2 rounded-xl hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <QrCode size={18} />
                  Check-in All
                </button>
              </div>
            </div>

            {visibleRegistrations.length === 0 ? (
              <p className="text-gray-400">
                {regFilter === "pending"
                  ? "Everyone has already been checked in."
                  : "No registrations yet."}
              </p>
            ) : (
              <div className="space-y-4">
                {visibleRegistrations.map((booking) => (
                  <div
                    key={booking.ticketId}
                    className="bg-[#1a1a25] rounded-xl p-5 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="text-xl font-semibold capitalize">
                        {booking.userName}
                      </h3>

                      <p className="text-gray-400 mt-1">
                        {booking.userEmail} • {booking.eventTitle}
                      </p>
                    </div>

                    {booking.checkedIn ? (
                      <span className="bg-green-950 text-green-400 px-4 py-1 rounded-lg text-xs tracking-widest">
                        CHECKED IN
                      </span>
                    ) : (
                      <button
                        onClick={() =>
                          dispatch(checkInBooking(booking.ticketId))
                        }
                        className="flex items-center gap-2 bg-violet-900 text-violet-300 hover:bg-violet-800 px-4 py-1 rounded-lg text-xs tracking-widest cursor-pointer"
                      >
                        <QrCode size={14} />
                        CHECK IN
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MyEvents;
