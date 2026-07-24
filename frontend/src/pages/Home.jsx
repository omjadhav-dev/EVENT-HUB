import React from "react";
import Card from "../components/Card";
import DiscoverEvents from "../components/DiscoverEvents";
import { useSelector } from "react-redux";
import image from "../assets/image.png";
import { Link, useNavigate } from "react-router-dom";

function Home() {
  // Pulled live from Redux so newly published events show up here too.
  const events = useSelector((state) => state.event.list);
  const authStatus = useSelector((state) => state.auth.status);
  const userData = useSelector((state) => state.auth.userData);

  const navigate = useNavigate();

  const handleHostClick = () => {
    // Only an already-registered Organizer can jump straight to Create.
    // Everyone else has to register as a host first.
    if (authStatus && userData?.userType === "Organizer") {
      navigate("/create");
      return;
    }

    if (authStatus) {
      // Logged in, but as an Attendee - point them to their profile so
      // they can switch account type before hosting.
      alert(
        "Your account is registered as an Attendee. Switch to Organizer in your profile to host events.",
      );
      navigate("/profile");
      return;
    }

    alert("Please register as a host to start hosting events.");
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
          <h1 className="text-4xl font-bold">Events Near You</h1>

          <button className="text-amber-400 cursor-pointer hover:text-yellow-100">
            View All →
          </button>
        </div>

        <div className="grid grid-cols-3 gap-8 mt-10">
          {events.slice(0, 3).map((event) => (
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
