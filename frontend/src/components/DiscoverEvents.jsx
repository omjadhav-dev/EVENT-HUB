import React, { useEffect, useState } from "react";

import event from "../assets/event.jpg";
import event2 from "../assets/event2.jpg"
import event3 from "../assets/event3.avif"


function DiscoverEvents() {
  const events = [
    {
      image: event,
      title: "Tech Event in Mumbai",
      description: "Hackathon related to Web Development.",
    },
    {
      image: event2,
      title: "Music Festival",
      description: "Enjoy live performances from top artists.",
    },
    {
      image: event3,
      title: "Startup Meetup",
      description: "Network with founders and investors.",
    },
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % events.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="px-20 py-20 text-white">
      <h1 className="text-5xl font-bold text-center">Discover Events</h1>

      <p className="text-gray-300 mt-2 mb-8 text-center">
        Explore featured events, find what's happening locally, or browse
        events across India.
      </p>

      <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
        <img
          src={events[current].image}
          alt={events[current].title}
          className="w-full h-100 object-cover"
        />

        <div className="p-6">
          <h2 className="text-3xl font-bold">
            {events[current].title}
          </h2>

          <p className="mt-3 text-gray-300">
            {events[current].description}
          </p>
        </div>
      </div>
    </section>
  );
}

export default DiscoverEvents;