import { Event } from "../models/event.models.js";
import { Registration } from "../models/registration.models.js";
import { Message } from "../models/message.models.js";
import { EventArchive } from "../models/eventArchive.models.js";

// Permanently removes any event whose `end` time has already passed,
// along with its registrations and chat messages - otherwise those
// would be left as orphaned documents once the event itself is gone.
// Before deleting, it snapshots each event's stats into EventArchive so
// the Analytics dashboard can still show attendance/revenue history for
// events that no longer exist anywhere else (see event.controllers.js
// getHostAnalytics, which reads from both Event and EventArchive).
// This isn't tied to any HTTP request; it's called on server startup
// and then on a recurring schedule (see index.js).
export async function deleteExpiredEvents() {
  const now = new Date();

  const expiredEvents = await Event.find({ end: { $lt: now } }).select(
    "organizerId title start end capacity ticketType ticketPrice",
  );
  if (expiredEvents.length === 0) {
    return { deletedCount: 0 };
  }

  const expiredIds = expiredEvents.map((event) => event._id);

  const registrations = await Registration.find({
    eventId: { $in: expiredIds },
    status: "Confirmed",
  }).select("eventId checkedIn");

  const registrationsByEvent = new Map();
  registrations.forEach((registration) => {
    const key = registration.eventId.toString();
    if (!registrationsByEvent.has(key)) registrationsByEvent.set(key, []);
    registrationsByEvent.get(key).push(registration);
  });

  const archiveDocs = expiredEvents.map((event) => {
    const eventRegs = registrationsByEvent.get(event._id.toString()) || [];
    const checkedIn = eventRegs.filter((r) => r.checkedIn).length;
    const revenue =
      event.ticketType === "Paid" ? eventRegs.length * event.ticketPrice : 0;

    return {
      organizerId: event.organizerId,
      title: event.title,
      start: event.start,
      end: event.end,
      capacity: event.capacity,
      ticketType: event.ticketType,
      registrations: eventRegs.length,
      checkedIn,
      revenue,
    };
  });

  await EventArchive.insertMany(archiveDocs);

  await Registration.deleteMany({ eventId: { $in: expiredIds } });
  await Message.deleteMany({ eventId: { $in: expiredIds } });
  const result = await Event.deleteMany({ _id: { $in: expiredIds } });

  console.log(`Auto-deleted ${result.deletedCount} expired event(s) (archived for analytics).`);
  return { deletedCount: result.deletedCount };
}
