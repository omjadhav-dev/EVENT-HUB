import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { generateDescription } from "../api/event.api";
import { useToast } from "../context/useToast";

const EMPTY_VALUES = {
  title: "",
  description: "",
  category: "",
  mode: "",
  tags: "",
  start: "",
  end: "",
  venue: "",
  city: "",
  meetingLink: "",
  ticketType: "Free",
  ticketPrice: "",
  capacity: "",
};

// Shared by Create.jsx and EditEvent.jsx - `initialValues` seeds the
// form (defaults to a blank event), `onSubmit(values, imageFile)` does
// the actual create/update API call and navigation, this component only
// owns the form fields and submission plumbing.
function EventForm({
  initialValues = {},
  existingImageUrl,
  onSubmit,
  submitLabel = "Publish Event",
  cancelTo = "/myevents",
  eyebrow = "New Event",
  heading = "Create your event",
}) {
  const values = { ...EMPTY_VALUES, ...initialValues };
  const toast = useToast();

  const [title, setTitle] = useState(values.title);
  const [description, setDescription] = useState(values.description);
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState(values.category);
  const [mode, setMode] = useState(values.mode);
  const [image, setImage] = useState(null);
  const [tags, setTags] = useState(values.tags);
  const [start, setStart] = useState(values.start);
  const [end, setEnd] = useState(values.end);
  const [venue, setVenue] = useState(values.venue);
  const [city, setCity] = useState(values.city);
  const [meetingLink, setMeetingLink] = useState(values.meetingLink);
  const [ticketType, setTicketType] = useState(values.ticketType);
  const [ticketPrice, setTicketPrice] = useState(values.ticketPrice);
  const [capacity, setCapacity] = useState(values.capacity);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleGenerateDescription = async () => {
    if (!topic.trim()) {
      toast.error("Give the AI a quick topic to work from first.");
      return;
    }

    setGenerating(true);
    try {
      const res = await generateDescription({ topic, category, mode, tags });
      setDescription(res.data.description);
      toast.success("Feel free to tweak it before publishing.", {
        title: "Description generated",
      });
    } catch (err) {
      toast.error(err.message || "Something went wrong while generating a description.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (ticketType === "Paid" && (!ticketPrice || Number(ticketPrice) <= 0)) {
      setError("Enter a ticket price for a paid event.");
      return;
    }

    if (mode === "Offline" && (!venue.trim() || !city.trim())) {
      setError("Enter a venue and city for an offline event.");
      return;
    }

    if (mode === "Online" && !meetingLink.trim()) {
      setError("Add a meeting link for an online event.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(
        {
          title,
          description,
          category,
          mode,
          tags,
          start,
          end,
          venue: mode === "Offline" ? venue : "",
          city: mode === "Offline" ? city : "",
          meetingLink: mode === "Online" ? meetingLink : "",
          ticketType,
          ticketPrice: ticketType === "Paid" ? ticketPrice : 0,
          capacity,
        },
        image,
      );
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="mb-10 mt-20">
          <p className="text-violet-500 uppercase tracking-[0.25em] text-sm px-1">{eyebrow}</p>
          <h1 className="text-4xl font-bold mt-2">{heading}</h1>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-1 gap-8">
            {/* Left Card */}

            <div className="bg-[#15151d] border border-gray-800 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-6">Basics</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">TITLE *</label>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full bg-[#1f1f2b] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="bg-[#1a1a24] border border-violet-900/60 rounded-xl p-4">
                  <label className="flex items-center gap-2 text-sm text-violet-300 mb-2">
                    <Sparkles size={16} />
                    Let AI draft your description
                  </label>

                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. a beginner-friendly React workshop for college students"
                      className="flex-1 bg-[#1f1f2b] border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateDescription}
                      disabled={generating}
                      className="shrink-0 flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition"
                    >
                      <Sparkles size={14} />
                      {generating ? "Generating..." : "Generate"}
                    </button>
                  </div>
                  <p className="text-gray-500 text-xs mt-2">
                    Describe the topic in a few words - category/mode/tags below are used as
                    context automatically.
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">DESCRIPTION *</label>

                  <textarea
                    rows="4"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#1f1f2b] border border-gray-700 rounded-lg px-4 py-3 resize-none focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">CATEGORY *</label>

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
                  <label className="block text-sm text-gray-400 mb-2">MODE *</label>

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
                    BANNER IMAGE {existingImageUrl ? "" : "*"}
                  </label>

                  {existingImageUrl && !image && (
                    <img
                      src={existingImageUrl}
                      alt="Current banner"
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    required={!existingImageUrl}
                    onChange={(e) => setImage(e.target.files[0])}
                    className="w-full cursor-pointer text-gray-400 file:bg-violet-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-lg file:mr-4 cursor-pointer"
                  />
                  {existingImageUrl && (
                    <p className="text-gray-500 text-xs mt-2">
                      Leave empty to keep the current banner.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">TAGS *</label>

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
                  <label className="block text-sm text-gray-400 mb-2">START *</label>

                  <input
                    type="datetime-local"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    required
                    className="w-full bg-[#1f1f2b] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">END *</label>

                  <input
                    type="datetime-local"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    required
                    className="w-full bg-[#1f1f2b] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500"
                  />
                </div>

                {mode === "Online" ? (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      MEETING LINK (Zoom / Google Meet) *
                    </label>

                    <input
                      type="url"
                      placeholder="https://meet.google.com/xxx-xxxx-xxx"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      required
                      className="w-full bg-[#1f1f2b] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500"
                    />
                    <p className="text-gray-500 text-xs mt-2">
                      Only shown to people who've registered for this event.
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">VENUE *</label>

                      <input
                        type="text"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        required={mode !== "Online"}
                        className="w-full bg-[#1f1f2b] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">CITY *</label>

                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required={mode !== "Online"}
                        className="w-full bg-[#1f1f2b] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Tickets & Capacity */}

            <div className="bg-[#15151d] border border-gray-800 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-6">Tickets & Capacity</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">TICKET TYPE *</label>

                  <select
                    value={ticketType}
                    required
                    onChange={(e) => setTicketType(e.target.value)}
                    className="w-full bg-[#1f1f2b] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500"
                  >
                    <option>Free</option>
                    <option>Paid</option>
                  </select>
                </div>

                {ticketType === "Paid" && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      TICKET PRICE (\u20B9) *
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(e.target.value)}
                      required
                      className="w-full bg-[#1f1f2b] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-400 mb-2">CAPACITY *</label>

                  <input
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    required
                    className="w-full bg-[#1f1f2b] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}

          <div className="flex justify-end gap-4 mt-10">
            <Link to={cancelTo}>
              <button
                type="button"
                className="px-6 py-3 cursor-pointer rounded-xl border border-gray-700 hover:bg-gray-800 transition"
              >
                Cancel
              </button>
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 cursor-pointer rounded-xl bg-violet-600 hover:bg-violet-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventForm;
