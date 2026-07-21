import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import eventList from "../data/eventList";

function Explore() {
  // Categories
  const categories = ["All", "Technology", "Seminar", "Meetup", "Hackathon"];

  // Search Input
  const [search, setSearch] = useState("");

  // Active Category
  const [activeCategory, setActiveCategory] = useState("All");

  // Events
  const [events, setEvents] = useState([]);

  // Loading State
  const [loading, setLoading] = useState(false);

  // =========================================================
  // Temporary Dummy Data
  // This will be replaced by Backend API
  // =========================================================

  useEffect(() => {
    setLoading(true);

    setEvents(eventList);
    setLoading(false);

    // =========================================================
    // FUTURE BACKEND
    // =========================================================

    // async function fetchEvents() {
    //   setLoading(true);
    //
    //   const response = await axios.get("/api/events");
    //
    //   setEvents(response.data);
    //
    //   setLoading(false);
    // }
    //
    // fetchEvents();
  }, []);

  // =========================================================
  // Filtering
  // =========================================================

  const filteredEvents = events.filter((event) => {
    const matchesCategory =
      activeCategory === "All" || event.category === activeCategory;

    const matchesSearch = event.title
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen text-white px-6 py-28">
      {/* Heading */}

      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold">Explore Events</h1>

        <p className="text-gray-400 mt-2">
          Discover amazing events happening around you.
        </p>
      </div>

      {/* Search */}

      <div className="flex justify-center mb-8">
        <input
          type="search"
          placeholder="Search Events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xl px-5 py-3 rounded-lg bg-gray-800 border border-gray-700 outline-none focus:border-blue-500"
        />
      </div>

      {/* Categories */}

      <div className="flex flex-wrap justify-center gap-4 mb-10">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-5 py-2 rounded-full transition cursor-pointer ${
              activeCategory === category
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Cards */}

      {loading ? (
        <h2 className="text-center text-gray-400">Loading Events...</h2>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <Card
    key={event.id}
    id={event.id}
    image={event.image}
    title={event.title}
    category={event.category}
    priceType={event.priceType}
    date={event.date}
    location={event.location}
    tags={event.tags}
/>
            ))
          ) : (
            <h2 className="col-span-full text-center text-gray-400">
              No Events Found
            </h2>
          )}
        </div>
      )}
    </div>
  );
}

export default Explore;
