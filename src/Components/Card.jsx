import React from "react";

function Card({ image, title, description }) {
  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden cursor-pointer">
      <img
        src={image}
        alt={title}
        className="h-52 w-full object-cover"
      />

      <div className="p-4">
        <h2 className="text-xl font-semibold">{title}</h2>

        <p className="text-gray-300 mt-2">
          {description}
        </p>

        <button className="mt-4 w-full bg-amber-400 text-black py-2 rounded-lg cursor-pointer">
          Book Now
        </button>
      </div>
    </div>
  );
}

export default Card;