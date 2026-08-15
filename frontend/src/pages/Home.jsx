import { useEffect, useState } from "react";
import Card from "../components/Card";
import DiscoverEvents from "../components/DiscoverEvents";
import { useSelector, useDispatch } from "react-redux";
import image from "../assets/image.png";
import { Link, useNavigate } from "react-router-dom";
import { getAllEvents } from "../api/event.api";
import { setEvents } from "../store/eventSlice";
import { useToast } from "../context/useToast";

function Home() {
  const events = useSelector((state) => state.event.list);
  const authStatus = useSelector((state) => state.auth.status);
  const userData = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();
  const toast = useToast();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllEvents({ limit: 6, sortBy: "start", sortType: "asc" })
      .then((res) => dispatch(setEvents(res.data.events)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [dispatch]);

  const handleHostClick = () => {
    // Only an already-registered Host can jump straight to Create.
    // Everyone else has to register as a host first.
    if (authStatus && userData?.userType === "Host") {
      navigate("/create");
      return;
    }

    toast.info("Please register as a host to start hosting events.", {
      title: "Host account required",
    });
    navigate("/signup", { state: { presetUserType: "host" } });
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-between px-20 overflow-hidden text-white">
        <div className="absolute -left-24 top-20 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-pink-500 to-purple-700 blur-3xl opacity-30"></div>

        <div className="relative max-w-xl space-y-6 z-10">
          <p className="text-amber-400 font-semibold">EventHub*</p>

          <h1 className="text-6xl font-bold leading-tight">
            Discover & Create Amazing Events
          </h1>

          <p className="text-lg text-gray-300">
            Whether you're hosting or attending, Spott makes every event
            memorable. Join our community today.
          </p>
          <Link to="/explore">
            <button className="bg-amber-50 text-gray-900  cursor-pointer px-6 py-3 rounded-xl font-semibold hover:bg-amber-200 transition">
              Get Started
            </button>
          </Link>
          <button
            onClick={handleHostClick}
            className="text-white border border-amber-50 border-2 px-6 py-3 ml-5 rounded-xl font-semibold hover:text-amber-300 cursor-pointer transition"
          >
            Host an event
          </button>
        </div>
        <img
          src={image}
          alt="Event highlight"
          className="relative z-10 max-w-md w-full mt-10 hidden md:block object-contain"
        />
        <div className="absolute right-10 bottom-10 h-[350px] w-[350px] rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 blur-3xl opacity-30"></div>
      </section>

      <DiscoverEvents />

      <section className="px-20 py-16 text-white">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Upcoming Events</h1>

          <Link
            to="/explore"
            className="text-amber-400 cursor-pointer hover:text-yellow-100"
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-400 mt-10">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-gray-400 mt-10">
            No events yet - be the first to host one.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
            {events.slice(0, 3).map((event) => (
              <Card key={event._id} event={event} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default Home;
