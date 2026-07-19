import React from "react";
import { Link } from "react-router-dom";
import spott from "../assets/spott.png";

function Header() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gray-950">
  <div className="flex items-center justify-between px-5 py-4">
    <img src={spott} alt="Logo" className="h-12 w-20" />

    <div className="flex items-center border rounded-2xl overflow-hidden bg-white">
      <input
        type="text"
        placeholder="Search events..."
        className="h-10 w-64 px-4 outline-none"
      />

      <select className="h-10 px-2 border-l">
        <option className="">Mumbai</option>
      </select>

      <select className="h-10 px-2 border-l">
        <option className="">Maharashtra</option>
      </select>
    </div>

    <div className="flex items-center gap-4">
      <Link to="/" className="text-white hover:text-gray-300">
        Explore
      </Link>

      <button className="h-10 px-5 rounded-2xl bg-amber-50 cursor-pointer">
        + Create Event
      </button>

      <button className="h-12 w-12 rounded-full bg-amber-50 cursor-pointer">
        P
      </button>
    </div>
  </div>
</nav>
  );
}

export default Header;
