import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, CalendarDays, MapPin } from "lucide-react";
import { getAllEvents } from "../api/event.api";

const AUTOPLAY_MS = 5000;

function formatEventDate(isoDate) {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function DiscoverEvents() {
  const [events, setEvents] = useState([]);
  const [current, setCurrent] = useState(0);
  // "next" | "prev" - drives which direction the slide animates in from
  const [direction, setDirection] = useState("next");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllEvents({ limit: 6, sortBy: "start", sortType: "asc" })
      .then((res) => setEvents(res.data.events))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (events.length < 2) return;
    const interval = setInterval(() => {
      setDirection("next");
      setCurrent((prev) => (prev + 1) % events.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(interval);
  }, [events.length]);

  const goNext = () => {
    setDirection("next");
    setCurrent((prev) => (prev + 1) % events.length);
  };

  const goPrev = () => {
    setDirection("prev");
    setCurrent((prev) => (prev - 1 + events.length) % events.length);
  };

  if (loading || events.length === 0) {
    return (
      <section className="px-20 py-20 text-white">
        <h1 className="text-5xl font-bold text-center">Discover Events</h1>
        <p className="text-gray-300 mt-2 mb-8 text-center">
          Explore featured events, find what's happening locally, or browse
          events across India.
        </p>
        <div className="bg-gray-800 rounded-2xl h-100 flex items-center justify-center text-gray-500">
          {loading ? "Loading events..." : "No events to discover yet."}
        </div>
      </section>
    );
  }

  const event = events[current];

  return (
    <section className="px-20 py-20 text-white">
      <h1 className="text-5xl font-bold text-center">Discover Events</h1>

      <p className="text-gray-300 mt-2 mb-8 text-center">
        Explore featured events, find what's happening locally, or browse
        events across India.
      </p>

      <div className="relative bg-gray-800 rounded-2xl overflow-hidden shadow-lg group">
        <Link to={`/event/${event._id}`} key={event._id} className="block">
          <div
            key={event._id}
            className={`${
              direction === "next" ? "animate-[slide-in-next_0.5s_ease]" : "animate-[slide-in-prev_0.5s_ease]"
            }`}
          >
            <div className="relative h-100 overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            </div>

            <div className="p-6">
              <h2 className="text-3xl font-bold">{event.title}</h2>

              <div className="flex items-center gap-6 mt-3 text-gray-300 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} />
                  <span>{formatEventDate(event.start)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{event.mode === "Offline" ? event.city : event.mode}</span>
                </div>
              </div>

              <p className="mt-3 text-gray-300 line-clamp-2">{event.description}</p>
            </div>
          </div>
        </Link>

        {events.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                goPrev();
              }}
              className="absolute left-4 top-1/3 -translate-y-1/2 bg-black/50 hover:bg-black/80 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer"
              aria-label="Previous"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                goNext();
              }}
              className="absolute right-4 top-1/3 -translate-y-1/2 bg-black/50 hover:bg-black/80 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer"
              aria-label="Next"
            >
              <ChevronRight size={22} />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {events.map((e, i) => (
                <button
                  key={e._id}
                  onClick={(ev) => {
                    ev.preventDefault();
                    setDirection(i > current ? "next" : "prev");
                    setCurrent(i);
                  }}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === current ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes slide-in-next {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-prev {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}

export default DiscoverEvents;
