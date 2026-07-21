import React, { useState, useEffect } from "react";
import spott from "../assets/spott.png";
import Card from "../components/Card";
import DiscoverEvents from "../components/DiscoverEvents";
import eventList from "../data/eventList";
import { Link } from "react-router-dom";
function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    setEvents(eventList);
    setLoading(false);
  }, []);

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-between px-20 overflow-hidden text-white">
        <div className="absolute -left-24 top-20 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-pink-500 to-purple-700 blur-3xl opacity-30"></div>

        <div className="relative max-w-xl space-y-6 z-10">
          <p className="text-amber-400 font-semibold">Spott*</p>

          <h1 className="text-6xl font-bold leading-tight">
            Discover & Create Amazing Events
          </h1>

          <p className="text-lg text-gray-300">
            Whether you're hosting or attending, Spott makes every event
            memorable. Join our community today.
          </p>

          <button className="bg-amber-50 text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-amber-200 transition">
            Get Started
          </button>
          <button className="text-white border border-amber-50 border-2 px-6 py-3 ml-5 rounded-xl font-semibold hover:text-amber-300 cursor-pointer transition">
            Host an event
          </button>
        </div>

        <div className="absolute right-10 bottom-10 h-[350px] w-[350px] rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 blur-3xl opacity-30"></div>
      </section>

      <DiscoverEvents />

      <section className="px-20 py-16 text-white">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Events Near You</h1>
<Link to="/explore">
          <button className="text-amber-400 cursor-pointer hover:text-yellow-100">
            View All →
          </button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-8 mt-10">
          {events.slice(0,3).map((event) => (
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
          ))}
        </div>
      </section>
    </>
  );
}

export default Home;
