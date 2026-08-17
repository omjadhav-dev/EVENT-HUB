import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { CalendarDays, Users, QrCode, Eye, Plus, Trash2, ScanLine, RefreshCw, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { getMyEvents, deleteEvent as deleteEventApi } from "../api/event.api";
import { getEventRegistrations, checkInAttendee } from "../api/registration.api";
import { useToast } from "../context/useToast";
import QRScanner from "../components/QRScanner";
import ConfirmModal from "../components/ConfirmModal";

function MyEvents() {
  const userData = useSelector((state) => state.auth.userData);
  const toast = useToast();

  const [myEvents, setMyEvents] = useState([]);
  // Flat list of every registration across all of this organizer's events,
  // each tagged with its eventId/eventTitle for display below.
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regFilter, setRegFilter] = useState("all");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(() => {
    if (!userData) return;
    getMyEvents()
      .then(async (res) => {
        const events = res.data;
        setMyEvents(events);

        // The backend has no "all registrations for all my events" endpoint,
        // so fetch each event's registrations and flatten them. NOTE:
        // getEventRegistrations doesn't populate `eventId` on each
        // registration (only `userId`), so it stays a plain ObjectId
        // string - comparing it directly against event._id would always
        // be comparing a string to itself and should work, but to avoid
        // any ambiguity (and because other code was previously comparing
        // against eventId?._id, which is never populated here and was
        // silently always undefined) we tag each one explicitly.
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
  const visibleRegistrations = regFilter === "pending" ? pendingRegistrations : myRegistrations;

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

  const handleBulkCheckIn = async () => {
    if (pendingRegistrations.length === 0) return;
    // Backend only supports checking in one registration (by QR code) at a
    // time, so "Check-in All" just fires that call for each pending one.
    await Promise.all(
      pendingRegistrations.map((r) =>
        checkInAttendee(r.qrCode).catch(() => null),
      ),
    );
    toast.success("Everyone pending has been checked in.");
    loadData();
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
              const regsForThisEvent = registrations.filter(
                (r) => r.hostEventId === event._id && r.status !== "Cancelled",
              ).length;

              return (
                <div
                  key={event._id}
                  className="border border-violet-500 rounded-2xl bg-[#13131b] p-8 hover:border-violet-400 transition"
                >
                  <Link to={`/event/${event._id}`}>
                    <div className="flex justify-between items-center">
                      <h2 className="text-3xl font-bold">{event.title}</h2>

                      <span className="bg-violet-900 text-violet-300 px-4 py-1 rounded-lg text-xs tracking-widest">
                        PUBLISHED
                      </span>
                    </div>

                    <div className="flex gap-6 text-gray-400 mt-5">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={18} />
                        {new Date(event.start).toLocaleDateString(undefined, {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </div>

                      <div className="flex items-center gap-2">
                        <Users size={18} />
                        {regsForThisEvent} regs
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-5 mt-5">
                    <Link
                      to={`/myevents/${event._id}/edit`}
                      className="flex items-center gap-2 text-violet-400 hover:text-violet-300 text-sm font-semibold cursor-pointer"
                    >
                      <Pencil size={16} />
                      Edit Event
                    </Link>

                    <button
                      onClick={() => setDeleteTarget(event)}
                      className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-semibold cursor-pointer"
                    >
                      <Trash2 size={16} />
                      Delete Event
                    </button>
                  </div>
                </div>
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
                {visibleRegistrations.map((registration) => (
                  <div
                    key={registration._id}
                    className="bg-[#1a1a25] rounded-xl p-5 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="text-xl font-semibold capitalize">
                        {registration.userId?.name}
                      </h3>

                      <p className="text-gray-400 mt-1">
                        {registration.userId?.email} • {registration.eventTitle}
                      </p>
                    </div>

                    {registration.checkedIn ? (
                      <span className="bg-green-950 text-green-400 px-4 py-1 rounded-lg text-xs tracking-widest">
                        CHECKED IN
                      </span>
                    ) : (
                      <button
                        onClick={() => handleCheckIn(registration)}
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
