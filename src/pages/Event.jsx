import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import eventList from "../data/eventList";

function Event() {
  const { id } = useParams();

  const [event, setEvent] = useState(null);

  useEffect(() => {
    const selectedEvent = eventList.find((item) => item.id === Number(id));

    setEvent(selectedEvent);
  }, [id]);

  if (!event) {
    return (
      <div className="h-screen flex justify-center items-center text-white">
        Event Not Found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white py-24">
      {/* Hero */}

      <div className="max-w-7xl mx-auto px-6">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-[420px] object-cover rounded-2xl"
        />

        <div className="grid lg:grid-cols-3 gap-8 mt-10">
          {/* Left */}

          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold">{event.title}</h1>

            <p className="mt-3 text-gray-400">Hosted by {event.host}</p>

            <div className="grid md:grid-cols-2 gap-5 mt-10">
              <div className="bg-slate-900 rounded-xl p-5">
                <p className="text-gray-400">Starts</p>
                <h3>{event.start}</h3>
              </div>

              <div className="bg-slate-900 rounded-xl p-5">
                <p className="text-gray-400">Ends</p>
                <h3>{event.end}</h3>
              </div>

              <div className="bg-slate-900 rounded-xl p-5">
                <p className="text-gray-400">Location</p>
                <h3>{event.location}</h3>
              </div>

              <div className="bg-slate-900 rounded-xl p-5">
                <p className="text-gray-400">Registered</p>
                <h3>{event.attendees} Attendees</h3>
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-semibold mb-4">About Event</h2>

              <p className="text-gray-300 leading-8">{event.description}</p>
            </div>
          </div>

          {/* Right */}

          <div>
            <div className="bg-slate-900 rounded-2xl p-6 sticky top-28">
              <h2 className="text-2xl font-bold">Choose Ticket</h2>

              <p className="text-gray-400 mt-2">1 Tier Available</p>

              <div className="bg-slate-800 rounded-xl p-5 mt-6">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">General</h3>

                    <p className="text-gray-400">
                      {event.attendees}/{event.slots} Registered
                    </p>
                  </div>

                  <h3 className="text-blue-500">{event.price}</h3>
                </div>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl mt-6">
                Register Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Event;
