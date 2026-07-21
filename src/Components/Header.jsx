import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getStates, getCities } from "../api/locationApi";
import logo from "../assets/logo.png";

function Header() {
  const authStatus = useSelector((state) => state.auth.status);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedState, setSelectedState] = useState("Maharashtra");
  const [selectedCity, setSelectedCity] = useState("Mumbai");

  useEffect(() => {
    async function loadStates() {
      const data = await getStates();
      setStates(data);
    }

    loadStates();
  }, []);

  useEffect(() => {
    if (!selectedState) return;

    async function loadCities() {
      const data = await getCities(selectedState);
      setCities(data);
    }

    loadCities();
  }, [selectedState]);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gray-950">
      <div className="flex items-center justify-between px-5 py-2">
        <Link to="/" className="flex items-center">
          <img
            src={logo}
            alt="Logo"
            className="h-24 w-auto object-contain -my-4"
          />
        </Link>

        <div className="flex items-center border rounded-2xl overflow-hidden bg-white">
          <input
            type="text"
            placeholder="Search events..."
            className="h-10 w-60 px-4 outline-none"
          />

          <select
            className="h-10 w-30 px-3 border-l"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <option value="">City</option>

            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <select
            className="h-10 w-35 px-1 border-l"
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedCity("");
            }}
          >
            <option value="">State</option>

            {states.map((state) => (
              <option key={state.name} value={state.name}>
                {state.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/explore" className="text-white hover:text-gray-300">
            Explore
          </Link>

          <button className="h-10 px-5 rounded-2xl bg-amber-50">
            + Create Event
          </button>

          {authStatus ? (
            <button className="h-12 w-12 rounded-full bg-blue-600 text-white">
              P
            </button>
          ) : (
            <>
              <Link to="/login" className="text-white">
                Login
              </Link>

              <Link
                to="/signup"
                className="px-5 py-2 rounded-2xl bg-blue-600 text-white"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;
