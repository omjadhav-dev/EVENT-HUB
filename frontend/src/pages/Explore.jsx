import React, { useState } from "react";
import { useSelector } from "react-redux";
import Card from "../components/Card";
import { ChevronLeft, ChevronRight } from "lucide-react";

const EVENTS_PER_PAGE = 6;

function Explore() {
  // Categories
  const categories = ["All", "Technology", "Seminar", "Meetup", "Hackathon", "Offline", "Online", "Paid", "Free"];

  // Search Input
  const [search, setSearch] = useState("");

  // Active Category
  const [activeCategory, setActiveCategory] = useState("All");

  // Current page (1-indexed)
  const [currentPage, setCurrentPage] = useState(1);

  // Events - pulled live from Redux so events published via Create.jsx
  // show up here immediately, alongside the seeded dummy events.
  const events = useSelector((state) => state.event.list);

  // =========================================================
  // Filtering
  // =========================================================

  const filteredEvents = events.filter((event) => {
    const matchesCategory =
      activeCategory === "All" || event.category === activeCategory || event.mode === activeCategory || event.type === activeCategory;

    const matchesSearch = event.title
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Whenever the search term or category changes, the result set changes
  // shape, so the change handlers below reset back to page 1 rather than
  // leaving the user stranded on a page that may no longer exist.

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEvents.length / EVENTS_PER_PAGE),
  );

  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * EVENTS_PER_PAGE,
    currentPage * EVENTS_PER_PAGE,
  );

  return (
    <div className="min-h-screen text-white px-6 py-28">
      {/* Heading */}

      <div className="text-center mb-8">
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
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full max-w-xl px-5 py-2 rounded-lg bg-gray-800 border border-gray-700 outline-none focus:border-blue-500"
        />
      </div>

      {/* Categories */}

      <div className="flex flex-wrap justify-center gap-4 mb-10">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => {
              setActiveCategory(category);
              setCurrentPage(1);
            }}
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

      {filteredEvents.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedEvents.map((event) => (
              <Card
                key={event.id}
                id={event.id}
                image={event.image}
                title={event.title}
                category={event.category}
                priceType={event.priceType}
                type={event.type}
                mode={event.mode}
                date={event.date}
                location={event.location}
                tags={event.tags}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={18} />
                Prev
              </button>

              <span className="text-gray-400">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      ) : (
        <h2 className="text-center text-gray-400">No Events Found</h2>
      )}
    </div>
  );
}

export default Explore;
