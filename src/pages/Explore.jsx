import React, { useEffect, useState } from "react";
import Card from "../components/Card";

function Explore() {
  // Categories
  const categories = [
    "All",
    "Technology",
    "Seminar",
    "Meetup",
    "Hackathon",
  ];

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

    const dummyEvents = [
      {
        id: 1,
        title: "React Meetup",
        description: "Networking session for React Developers.",
        category: "Meetup",
        image: "https://media.licdn.com/dms/image/v2/D5622AQEkI6QKxPivBw/feedshare-shrink_800/B56ZXrAH2_HEAg-/0/1743404433745?e=2147483647&v=beta&t=bBoZmG8b0eyr9ouqMXO3ygmGanctxQkvCDW1jIjTXGQ",
      },
      {
        id: 2,
        title: "AI Seminar",
        description: "Introduction to Artificial Intelligence.",
        category: "Seminar",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTq5PEj5O796siJc7gqVslCyNrETTPvkTLDxIHexv41ntZ5rmbpk9DTygjY&s=10",
      },
      {
        id: 3,
        title: "Hack India",
        description: "24 Hour National Hackathon.",
        category: "Hackathon",
        image: "https://khajana.blob.core.windows.net/hackindia/news/1782070280057_khisru_Untitled_design__90_.webp",
      },
      {
        id: 4,
        title: "Tech Conference",
        description: "Latest trends in Technology.",
        category: "Technology",
        image: "https://cdn.prod.website-files.com/645be0c3de94f82b7aad951a/66daefb089ead127c970d434_Featured-image.jpg",
      },
      {
        id: 5,
        title: "React Advanced",
        description: "Hooks, Redux and Performance.",
        category: "Technology",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjUmRyWIGFaEwnciDv-qVsNPQDzU3LLZm6a9hAinDR7w&s=10",
      },
      {
        id: 6,
        title: "Community Meetup",
        description: "Meet local developers.",
        category: "Meetup",
        image: "https://media.licdn.com/dms/image/v2/C5612AQEr3WmxhGSbxg/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1644862734630?e=2147483647&v=beta&t=M5AxxQvXksyGDUNYiIyZ7G0zAhfqdmYgrlQhMdTkLfI",
      },
    ];

    setEvents(dummyEvents);
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
      activeCategory === "All" ||
      event.category === activeCategory;

    const matchesSearch =
      event.title.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen text-white px-6 py-28">

      {/* Heading */}

      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold">
          Explore Events
        </h1>

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
        <h2 className="text-center text-gray-400">
          Loading Events...
        </h2>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <Card
                key={event.id}
                image={event.image}
                title={event.title}
                description={event.description}
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