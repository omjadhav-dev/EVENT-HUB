import React from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin } from "lucide-react";

function Card({
  id,
  image,
  title,
  category,
  priceType,
  type,
  mode,
  date,
  location,
  tags,
}) {
  return (
    <Link to={`/event/${id}`} className="group block">
      <div className="overflow-hidden rounded-2xl bg-[#16161f] border border-gray-800 hover:border-violet-500 transition-all duration-300 hover:-translate-y-2">
        {/* Image */}

        <div className="relative h-64 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          />

          {/* Category */}

          <span className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-lg text-xs uppercase tracking-wider font-semibold">
            {category}
          </span>

          {/* Price */}

          <span className="absolute top-4 right-4 bg-white text-black px-4 py-2 rounded-lg font-bold">
            {priceType}
          </span>
        </div>

        {/* Body */}

        <div className="p-6">
          <h2 className="text-3xl font-bold text-white group-hover:text-violet-400 transition">
            {title}
          </h2>

          {/* Date & Location */}

          <div className="flex items-center gap-6 mt-5 text-gray-400">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} />

              <span>{date}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin size={18} />
              {mode === "Offline" ? (
                <span>{location}</span>
              ) : (
                <span>{mode}</span>
              )}
            </div>
          </div>

          {/* Tags */}

          <div className="flex flex-wrap gap-3 mt-6">
            {tags?.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 rounded-full border border-violet-700 text-violet-400 bg-violet-950/30 text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default Card;
