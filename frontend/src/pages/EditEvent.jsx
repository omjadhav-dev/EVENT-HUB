import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getEventById, updateEvent } from "../api/event.api";
import { useToast } from "../context/useToast";
import EventForm from "../components/EventForm";

// Converts an ISO datetime string to the "YYYY-MM-DDTHH:mm" format the
// <input type="datetime-local"> needs. Uses local time (not UTC) so the
// displayed value matches what the host originally picked.
function toDatetimeLocal(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function EditEvent() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getEventById(eventId)
      .then((res) => setEvent(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [eventId]);

  if (!userData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4">
        <p className="text-gray-400">Log in as the event's host to edit it.</p>
        <Link to="/login" className="bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl font-semibold">
          Log In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading event...
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Event not found.
      </div>
    );
  }

  if (event.organizerId?._id !== userData._id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4 text-center px-4">
        <p className="text-gray-400">You can only edit events you created.</p>
        <Link to="/myevents" className="bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl font-semibold">
          Back to My Events
        </Link>
      </div>
    );
  }

  const handleUpdate = async (values, imageFile) => {
    await updateEvent(eventId, values, imageFile);
    toast.success("Your changes have been saved.", { title: "Event updated" });
    navigate(`/event/${eventId}`);
  };

  return (
    <EventForm
      initialValues={{
        title: event.title,
        description: event.description,
        category: event.category,
        mode: event.mode,
        tags: event.tags?.join(", ") || "",
        start: toDatetimeLocal(event.start),
        end: toDatetimeLocal(event.end),
        venue: event.venue,
        city: event.city,
        meetingLink: event.meetingLink,
        ticketType: event.ticketType,
        ticketPrice: event.ticketPrice,
        capacity: event.capacity,
      }}
      existingImageUrl={event.image}
      onSubmit={handleUpdate}
      submitLabel="Save Changes"
      cancelTo={`/event/${eventId}`}
      eyebrow="Edit Event"
      heading={`Editing "${event.title}"`}
    />
  );
}

export default EditEvent;
