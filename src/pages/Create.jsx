import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { details } from "../store/eventSlice";
import { Link } from "react-router-dom";

function Create() {
  const dispatch = useDispatch();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [mode, setMode] = useState("");
  const [image, setImage] = useState(null);
  const [tags, setTags] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    dispatch(
      details({
        title,
        description,
        category,
        mode,
        image,
        tags,
        start,
        end,
        venue,
        city,
      }),
    );
  };

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setMode("");
    setImage(null);
    setTags("");
    setStart("");
    setEnd("");
    setVenue("");
    setCity("");
  };

  return (
    <div className="min-h-screen text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="mb-10 mt-20">
          <p className="text-violet-500 uppercase tracking-[0.25em] text-sm px-1">
            New Event
          </p>

          <h1 className="text-4xl font-bold mt-2">Create your event</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-1 gap-8">
            {/* Left Card */}

            <div className="bg-[#15151d] border border-gray-800 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-6">Basics</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    TITLE *
                  </label>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full bg-[#1f1f2b] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    DESCRIPTION *
                  </label>

                  <textarea
                    rows="4"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#1f1f2b] border border-gray-700 rounded-lg px-4 py-3 resize-none focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    CATEGORY *
                  </label>

                  <select
                    value={category}
                    required
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#1f1f2b] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500"
                  >
                    <option value="">Select category</option>
                    <option>Conference</option>
                    <option>Hackathon</option>
                    <option>Meetup</option>
                    <option>Seminar</option>
                    <option>Workshop</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    MODE *
                  </label>

                  <select
                    value={mode}
                    required
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full bg-[#1f1f2b] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500"
                  >
                    <option value="">Select mode</option>
                    <option>Offline</option>
                    <option>Online</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    BANNER IMAGE *
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setImage(e.target.files[0])}
                    className="w-full cursor-pointer text-gray-400 file:bg-violet-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-lg file:mr-4 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    TAGS *
                  </label>

                  <input
                    type="text"
                    placeholder="ai, web-dev, dsa"
                    value={tags}
                    required
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full bg-[#1f1f2b] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            </div>

            {/* Right Card */}

            <div className="bg-[#15151d] border border-gray-800 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-6">When & Where</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    START *
                  </label>

                  <input
                    type="datetime-local"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    required
                    className="w-full bg-[#1f1f2b] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    END *
                  </label>

                  <input
                    type="datetime-local"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    required
                    className="w-full bg-[#1f1f2b] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    VENUE *
                  </label>

                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    required
                    className="w-full bg-[#1f1f2b] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    CITY *
                  </label>

                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full bg-[#1f1f2b] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}

          <div className="flex justify-end gap-4 mt-10">
            <Link to="/myevents"><button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 cursor-pointer rounded-xl border border-gray-700 hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            </Link>

            <button
              type="submit"
              className="px-6 py-3 cursor-pointer rounded-xl bg-violet-600 hover:bg-violet-500 transition"
            >
              Publish Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Create;
