import React from "react";
import eventList from "../data/eventList";
import { CalendarDays, Users, QrCode, Eye, Plus } from "lucide-react";
import { Link } from "react-router-dom";

function MyEvents() {
  return (
    <div className="min-h-screen bg-[#0d0d12] text-white px-12 py-10">
      {/* Heading */}
      <div className="flex justify-between items-center mb-10">
        <div className="mt-20">
          <p className="text-violet-500 uppercase tracking-widest text-sm">
            Organizer
          </p>

          <h1 className="text-6xl font-bold mt-2">Your events</h1>
        </div>
        <Link to="/create">
          <button className="flex cursor-pointer items-center gap-3 bg-violet-600 hover:bg-violet-500 px-5 py-4 rounded-full font-semibold">
            <Plus size={20} />
            Create Event
          </button>
        </Link>
      </div>

      {/* Stats */}

      <div className="grid grid-cols-3 gap-6 mb-12">
        <div className="border border-gray-700 rounded-2xl p-6 bg-[#13131b]">
          <CalendarDays className="text-violet-500 mb-4" size={28} />

          <h2 className="text-5xl font-bold">1</h2>

          <p className="uppercase tracking-widest text-gray-400 mt-2 text-sm">
            Total Events
          </p>
        </div>

        <div className="border border-gray-700 rounded-2xl p-6 bg-[#13131b]">
          <Users className="text-violet-500 mb-4" size={28} />

          <h2 className="text-5xl font-bold">1</h2>

          <p className="uppercase tracking-widest text-gray-400 mt-2 text-sm">
            Total Registrations
          </p>
        </div>

        <div className="border border-gray-700 rounded-2xl p-6 bg-[#13131b]">
          <QrCode className="text-violet-500 mb-4" size={28} />

          <h2 className="text-5xl font-bold">1</h2>

          <p className="uppercase tracking-widest text-gray-400 mt-2 text-sm">
            Ready To Check-in
          </p>
        </div>
      </div>

      {/* Bottom Section */}

      <div className="grid grid-cols-2 gap-8">
        {/* Event Card */}

        <div className="border border-violet-500 rounded-2xl bg-[#13131b] p-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">Hackathon</h2>

            <span className="bg-violet-900 text-violet-300 px-4 py-1 rounded-lg text-xs tracking-widest">
              PUBLISHED
            </span>
          </div>

          <div className="flex gap-6 text-gray-400 mt-5">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} />
              Jul 14, 2026
            </div>

            <div className="flex items-center gap-2">
              <Users size={18} />1 regs
            </div>
          </div>
        </div>

        {/* Registration */}

        <div className="border border-gray-700 rounded-2xl bg-[#13131b] p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Registrations</h2>

            <div className="flex gap-3">
              <button className="flex items-center gap-2 border border-gray-600 px-5 py-2 rounded-xl hover:bg-gray-800">
                <Eye size={18} />
                View
              </button>

              <button className="flex items-center gap-2 bg-violet-600 px-5 py-2 rounded-xl hover:bg-violet-500">
                <QrCode size={18} />
                Check-in
              </button>
            </div>
          </div>

          <div className="bg-[#1a1a25] rounded-xl p-5 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold">Shubham</h3>

              <p className="text-gray-400 mt-1">shubham@gmail.com • General</p>
            </div>

            <span className="bg-violet-900 text-violet-300 px-4 py-1 rounded-lg text-xs tracking-widest">
              CONFIRMED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyEvents;
