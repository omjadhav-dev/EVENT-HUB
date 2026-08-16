import { Link } from "react-router-dom";
import { CalendarDays, MapPin } from "lucide-react";

// Formats a backend event's ISO `start` date into "Feb 22, 2026" style,
// matching how the UI used to display the old dummy data's `date` field.
function formatEventDate(isoDate) {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

// `event` is a Mongo Event document: { _id, title, image, category, mode,
// tags, start, venue, city, ticketType, ticketPrice, ... }
function Card({ event }) {
  const priceLabel =
    event.ticketType === "Paid" ? `\u20B9${event.ticketPrice}` : "Free";

  return (
    <Link to={`/event/${event._id}`} className="group block">
      <div className="overflow-hidden rounded-2xl bg-[#16161f] border border-gray-800 hover:border-violet-500 transition-all duration-300 hover:-translate-y-2">
        {/* Image */}

        <div className="relative h-64 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          />

          {/* Category */}

          <span className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-lg text-xs uppercase tracking-wider font-semibold">
            {event.category}
          </span>

          {/* Price */}

          <span className="absolute top-4 right-4 bg-white text-black px-4 py-2 rounded-lg font-bold">
            {priceLabel}
          </span>
        </div>

        {/* Body */}

        <div className="p-6">
          <h2 className="text-3xl font-bold text-white group-hover:text-violet-400 transition">
            {event.title}
          </h2>

          {/* Date & Location */}

          <div className="flex items-center gap-6 mt-5 text-gray-400">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} />

              <span>{formatEventDate(event.start)}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin size={18} />
              {event.mode === "Offline" ? (
                <span>{event.city}</span>
              ) : (
                <span>{event.mode}</span>
              )}
            </div>
          </div>

          {/* Tags */}

          <div className="flex flex-wrap gap-2 mt-6">
            {event.tags?.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full border border-violet-700 text-violet-400 bg-violet-950/30 uppercase text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default Card;
