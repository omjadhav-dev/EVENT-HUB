import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  CalendarDays,
  Users,
  QrCode,
  Eye,
  Plus,
  Trash2,
  ScanLine,
  RefreshCw,
  Pencil,
  BarChart3,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getMyEvents, deleteEvent as deleteEventApi } from "../api/event.api";
import { getEventRegistrations, checkInAttendee } from "../api/registration.api";
import { useToast } from "../context/useToast";
import QRScanner from "../components/QRScanner";
import ConfirmModal from "../components/ConfirmModal";

// Shown when the host clicks "View" on an event row - all registrations
// for that one event, with per-attendee check-in and a "Check-in All"
// shortcut for the ones still pending.
function EventRegistrationsModal({ event, registrations, onCheckIn, onCheckInAll, onClose }) {
  const eventRegs = registrations.filter(
    (r) => r.hostEventId === event._id && r.status !== "Cancelled",
  );
  const pending = eventRegs.filter((r) => !r.checkedIn);

  return (
    <div className="fixed inset-0 z-[9997] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#13131b] border border-gray-800 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <div>
            <h3 className="text-2xl font-bold">{event.title}</h3>
            <p className="text-gray-400 text-sm mt-1">
              {eventRegs.length} registered
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <p className="text-gray-400 text-sm">
            {pending.length} pending check-in
          </p>
          <button
            onClick={() => onCheckInAll(event._id)}
            disabled={pending.length === 0}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer"
          >
            <QrCode size={16} />
            Check-in All
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-4 space-y-3">
          {eventRegs.length === 0 ? (
            <p className="text-gray-400 text-sm">No registrations yet.</p>
          ) : (
            eventRegs.map((registration) => (
              <div
                key={registration._id}
                className="bg-[#1a1a25] rounded-xl p-4 flex justify-between items-center"
              >
                <div>
                  <h4 className="font-semibold capitalize">
                    {registration.userId?.name}
                  </h4>
                  <p className="text-gray-400 text-sm mt-0.5">
                    {registration.userId?.email}
                  </p>
                </div>

                {registration.checkedIn ? (
                  <span className="bg-green-950 text-green-400 px-3 py-1 rounded-lg text-xs tracking-widest">
                    CHECKED IN
                  </span>
                ) : (
                  <button
                    onClick={() => onCheckIn(registration)}
                    className="flex items-center gap-2 bg-violet-900 text-violet-300 hover:bg-violet-800 px-3 py-1 rounded-lg text-xs tracking-widest cursor-pointer"
                  >
                    <QrCode size={14} />
                    CHECK IN
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function MyEvents() {
  const userData = useSelector((state) => state.auth.userData);
  const toast = useToast();

  const [myEvents, setMyEvents] = useState([]);
  // Flat list of every registration across all of this organizer's events,
  // each tagged with its eventId/eventTitle for display below.
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewingEvent, setViewingEvent] = useState(null);

  const loadData = useCallback(() => {
    if (!userData) return;
    getMyEvents()
      .then(async (res) => {
        const events = res.data;
        setMyEvents(events);

        // The backend has no "all registrations for all my events" endpoint,
        // so fetch each event's registrations and flatten them.
        const perEvent = await Promise.all(
          events.map((event) =>
            getEventRegistrations(event._id)
              .then((r) =>
                r.data.map((reg) => ({
                  ...reg,
                  eventTitle: event.title,
                  hostEventId: event._id,
                })),
              )
              .catch(() => []),
          ),
        );
        setRegistrations(perEvent.flat());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const myRegistrations = registrations.filter((r) => r.status !== "Cancelled");
  const pendingRegistrations = myRegistrations.filter((r) => !r.checkedIn);

  const handleCheckIn = async (registration) => {
    try {
      await checkInAttendee(registration.qrCode);
      setRegistrations((prev) =>
        prev.map((r) => (r._id === registration._id ? { ...r, checkedIn: true } : r)),
      );
      toast.success(`${registration.userId?.name || "Attendee"} checked in.`);
    } catch (err) {
      toast.error(err.message || "Something went wrong while checking in this attendee.");
    }
  };

  const handleCheckInAllForEvent = async (eventId) => {
    const pendingForEvent = pendingRegistrations.filter((r) => r.hostEventId === eventId);
    if (pendingForEvent.length === 0) return;

    await Promise.all(
      pendingForEvent.map((r) => checkInAttendee(r.qrCode).catch(() => null)),
    );
    setRegistrations((prev) =>
      prev.map((r) =>
        r.hostEventId === eventId && pendingForEvent.some((p) => p._id === r._id)
          ? { ...r, checkedIn: true }
          : r,
      ),
    );
    toast.success("Everyone pending has been checked in.");
  };

  // Called by the QR scanner modal with whatever it read (or whatever the
  // organizer typed manually) - looked up against this organizer's own
  // pending registrations so scanning someone else's event's ticket, or a
  // junk code, fails gracefully instead of hitting the API blind.
  const handleScanResult = async (code) => {
    const match = registrations.find((r) => r.qrCode === code.trim());

    if (!match) {
      toast.error("That code doesn't match a registration for your events.");
      return;
    }
    if (match.status === "Cancelled") {
      toast.error("This booking was cancelled.");
      return;
    }
    if (match.checkedIn) {
      toast.info(`${match.userId?.name || "This attendee"} is already checked in.`);
      return;
    }

    try {
      await checkInAttendee(match.qrCode);
      setRegistrations((prev) =>
        prev.map((r) => (r._id === match._id ? { ...r, checkedIn: true } : r)),
      );
      toast.success(`${match.userId?.name || "Attendee"} checked in!`, { title: "Scanned" });
      setScannerOpen(false);
    } catch (err) {
      toast.error(err.message || "Something went wrong while checking in this attendee.");
    }
  };

  const handleDeleteEvent = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await deleteEventApi(deleteTarget._id);
      setMyEvents((prev) => prev.filter((e) => e._id !== deleteTarget._id));
      setRegistrations((prev) => prev.filter((r) => r.hostEventId !== deleteTarget._id));
      toast.success(`"${deleteTarget.title}" has been deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.message || "Something went wrong while deleting this event.");
    } finally {
      setDeleting(false);
    }
  };

  const totalEvents = myEvents.length;

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
      <div className="flex justify-between items-center mb-10">
        <div className="mt-20">
          <p className="text-violet-500 uppercase tracking-widest text-sm">
            Organizer
          </p>

          <h1 className="text-6xl font-bold mt-2">Your events</h1>
        </div>
        <div className="flex gap-3">
          <Link to="/analytics">
            <button className="flex cursor-pointer items-center gap-3 border border-violet-600 text-violet-300 hover:bg-violet-600 hover:text-white px-5 py-4 rounded-full font-semibold transition">
              <BarChart3 size={20} />
              Analytics
            </button>
          </Link>

          <button
            onClick={loadData}
            title="Refresh registration counts"
            className="flex cursor-pointer items-center gap-2 border border-gray-700 text-gray-300 hover:bg-gray-800 px-5 py-4 rounded-full font-semibold transition"
          >
            <RefreshCw size={18} />
          </button>

          <button
            onClick={() => setScannerOpen(true)}
            className="flex cursor-pointer items-center gap-3 border border-violet-600 text-violet-300 hover:bg-violet-600 hover:text-white px-5 py-4 rounded-full font-semibold transition"
          >
            <ScanLine size={20} />
            Scan QR
          </button>

          <Link to="/create">
            <button className="flex cursor-pointer items-center gap-3 bg-violet-600 hover:bg-violet-500 px-5 py-4 rounded-full font-semibold">
              <Plus size={20} />
              Create Event
            </button>
          </Link>
        </div>
      </div>

      {scannerOpen && (
        <QRScanner onDetect={handleScanResult} onClose={() => setScannerOpen(false)} />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete this event?"
          message={`"${deleteTarget.title}" and all of its registrations will be permanently removed. This can't be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          loading={deleting}
          onConfirm={handleDeleteEvent}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {viewingEvent && (
        <EventRegistrationsModal
          event={viewingEvent}
          registrations={registrations}
          onCheckIn={handleCheckIn}
          onCheckInAll={handleCheckInAllForEvent}
          onClose={() => setViewingEvent(null)}
        />
      )}

      {/* Events table */}

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
        <div className="border border-gray-700 rounded-2xl bg-[#13131b] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-sm uppercase tracking-widest border-b border-gray-800">
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Registrations</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myEvents.map((event) => {
                  const regsForThisEvent = registrations.filter(
                    (r) => r.hostEventId === event._id && r.status !== "Cancelled",
                  ).length;

                  return (
                    <tr
                      key={event._id}
                      className="border-b border-gray-900 last:border-b-0 hover:bg-[#1a1a25] transition"
                    >
                      <td className="px-6 py-5">
                        <Link
                          to={`/event/${event._id}`}
                          className="font-semibold text-lg hover:text-violet-400"
                        >
                          {event.title}
                        </Link>
                      </td>

                      <td className="px-6 py-5 text-gray-400">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={16} />
                          {new Date(event.start).toLocaleDateString(undefined, {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          })}
                        </div>
                      </td>

                      <td className="px-6 py-5 text-gray-300">
                        <div className="flex items-center gap-2">
                          <Users size={16} />
                          {regsForThisEvent}/{event.capacity}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-8">
                          <Link
                            to={`/myevents/${event._id}/edit`}
                            title="Edit Event"
                            className="flex items-center gap-1 text-violet-400 hover:text-violet-300 text-sm font-semibold cursor-pointer"
                          >
                            <Pencil size={16} />
                            Edit
                          </Link>

                          <button
                            onClick={() => setDeleteTarget(event)}
                            title="Delete Event"
                            className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm font-semibold cursor-pointer"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>

                          <button
                            onClick={() => setViewingEvent(event)}
                            title="View Registrations"
                            className="flex items-center gap-1 text-gray-300 hover:text-white text-sm font-semibold cursor-pointer"
                          >
                            <Eye size={16} />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyEvents;
