import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import Card from "../components/Card";
import { ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";
import { getAllEvents } from "../api/event.api";
import { setEvents } from "../store/eventSlice";

const EVENTS_PER_PAGE = 6;

const CATEGORY_OPTIONS = ["Conference", "Hackathon", "Meetup", "Seminar", "Workshop"];
const PRICE_OPTIONS = ["Free", "Paid"];
const SORT_OPTIONS = [
  { value: "date-asc", label: "Date: Soonest first" },
  { value: "date-desc", label: "Date: Latest first" },
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Recently Listed" },
];

function Explore() {
  const [searchParams] = useSearchParams();

  // Search lives only in the Header now - read it reactively so results
  // update the moment the URL's ?search= changes, even while already on
  // this page (no local copy to fall out of sync).
  const search = searchParams.get("search") || "";
  const initialCity = searchParams.get("city") || "";

  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  // null = "follow the header's city search"; any other value (including
  // "" for "All Locations") means the person picked something in the
  // filter panel, which then takes priority over the header.
  const [locationOverride, setLocationOverride] = useState(null);
  const location = locationOverride !== null ? locationOverride : initialCity;
  const [sortBy, setSortBy] = useState("date-asc");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const events = useSelector((state) => state.event.list);

  // Fetched once - filtering/sorting below stays client-side.
  useEffect(() => {
    getAllEvents({ limit: 100 })
      .then((res) => dispatch(setEvents(res.data.events)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [dispatch]);

  const locationOptions = useMemo(
    () => [...new Set(events.map((e) => e.city).filter(Boolean))].sort(),
    [events],
  );

  const filteredEvents = useMemo(() => {
    const matches = events.filter((event) => {
      const matchesCategory = !category || event.category === category;
      const matchesPrice = !price || event.ticketType === price;
      const matchesLocation = !location || event.city === location;

      const haystack = `${event.title} ${event.tags?.join(" ") || ""}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());

      return matchesCategory && matchesPrice && matchesLocation && matchesSearch;
    });

    const sorted = [...matches];
    switch (sortBy) {
      case "date-desc":
        sorted.sort((a, b) => new Date(b.start) - new Date(a.start));
        break;
      case "popular":
        sorted.sort((a, b) => b.registrationCount - a.registrationCount);
        break;
      case "newest":
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "date-asc":
      default:
        sorted.sort((a, b) => new Date(a.start) - new Date(b.start));
    }

    return sorted;
  }, [events, category, price, location, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / EVENTS_PER_PAGE));

  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * EVENTS_PER_PAGE,
    currentPage * EVENTS_PER_PAGE,
  );

  const activeFilterCount = [category, price, location].filter(Boolean).length;

  const clearFilters = () => {
    setCategory("");
    setPrice("");
    setLocationOverride("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen text-white px-6 py-28">
      {/* Heading */}

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">Explore Events</h1>

        <p className="text-gray-400 mt-2">
          {search
            ? `Showing results for "${search}"`
            : "Discover amazing events happening around you."}
        </p>
      </div>

      {/* Filter + Sort bar */}

      <div className="max-w-5xl mx-auto mb-10">
        <div className="flex flex-wrap items-center gap-3 justify-center">
          <button
            onClick={() => setFiltersOpen((open) => !open)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border transition cursor-pointer ${
              filtersOpen || activeFilterCount > 0
                ? "bg-violet-600 border-violet-600 text-white"
                : "bg-gray-900/60 border-gray-800 text-gray-300 hover:border-violet-600"
            }`}
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-white/20 rounded-full text-xs px-2 py-0.5">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-800 rounded-full px-4 py-2.5">
            <ArrowUpDown size={16} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-sm text-gray-200 outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-gray-900">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white cursor-pointer"
            >
              <X size={14} />
              Clear filters
            </button>
          )}
        </div>

        {filtersOpen && (
          <div className="grid sm:grid-cols-3 gap-4 mt-5 bg-gray-900/40 border border-gray-800 rounded-2xl p-5">
            <div>
              <label className="block text-gray-400 text-xs uppercase tracking-widest mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-500"
              >
                <option value="">All Categories</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-xs uppercase tracking-widest mb-2">
                Price
              </label>
              <select
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-500"
              >
                <option value="">Any Price</option>
                {PRICE_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-xs uppercase tracking-widest mb-2">
                Location
              </label>
              <select
                value={location}
                onChange={(e) => {
                  setLocationOverride(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-500"
              >
                <option value="">All Locations</option>
                {locationOptions.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Cards */}

      {loading ? (
        <p className="text-center text-gray-400">Loading events...</p>
      ) : filteredEvents.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedEvents.map((event) => (
              <Card key={event._id} event={event} />
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
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
