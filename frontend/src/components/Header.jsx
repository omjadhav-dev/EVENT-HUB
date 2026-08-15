import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Search } from "lucide-react";
import { getStates, getCities } from "../api/locationApi";
import logo from "../assets/logo.png";

function Header() {
  const authStatus = useSelector((state) => state.auth.status);
  const userData = useSelector((state) => state.auth.userData);
  const navigate = useNavigate();

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    getStates()
      .then(setStates)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedState) return;

    getCities(selectedState)
      .then(setCities)
      .catch(() => {});
  }, [selectedState]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchText.trim()) params.set("search", searchText.trim());
    if (selectedCity) params.set("city", selectedCity);
    navigate(`/explore${params.toString() ? `?${params.toString()}` : ""}`);
  };

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

        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center border rounded-2xl overflow-hidden bg-white"
        >
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="h-10 w-60 pl-9 pr-3 outline-none"
            />
          </div>

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
              setCities([]);
            }}
          >
            <option value="">State</option>

            {states.map((state) => (
              <option key={state.name} value={state.name}>
                {state.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="h-10 px-4 bg-amber-50 hover:bg-amber-200 text-gray-900 font-semibold cursor-pointer"
          >
            Go
          </button>
        </form>

        <div className="flex items-center gap-4">
          <Link to="/explore" className="text-white hover:text-yellow-400">
            Explore
          </Link>
          {authStatus &&
            (userData?.userType === "Attendee" ? (
              <Link
                to="/mybookings"
                className="text-white hover:text-yellow-400"
              >
                My Bookings
              </Link>
            ) : (
              <Link to="/myevents" className="text-white hover:text-yellow-400">
                My Events
              </Link>
            ))}

          {authStatus ? (
            <Link to="/profile">
              <button className="h-12 w-12  text-2xl rounded-full bg-blue-600 text-white">
                {userData?.name?.charAt(0)}
              </button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-white hover:text-yellow-400">
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;
