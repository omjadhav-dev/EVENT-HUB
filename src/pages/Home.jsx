import React from "react";
import spott from "../assets/spott.png";
import event from "../assets/event.jpg";
import Card from "../components/Card";
import DiscoverEvents from "../components/DiscoverEvents";
function Home() {
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
          <button className="text-white border border-amber-50 border-2 px-6 py-3 ml-5 rounded-xl font-semibold hover:bg-amber-200 transition">Host an event</button>
        </div>

        <div className="absolute right-10 bottom-10 h-[350px] w-[350px] rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 blur-3xl opacity-30"></div>
      </section>

      <DiscoverEvents/>

      <section className="px-20 py-16 text-white">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Events Near You</h1>

          <button className="text-amber-400 cursor-pointer hover:text-yellow-100">View All →</button>
        </div>

        <div className="grid grid-cols-3 gap-8 mt-10">
          <Card />
          <Card />
          <Card />
        </div>
      </section>
    </>
  );
}

export default Home;
