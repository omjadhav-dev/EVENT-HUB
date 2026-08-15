import { Link } from "react-router-dom";

function Footer() {
  return (
    <div className="bg-gray-950 flex items-center justify-between px-6 py-4 text-white">
      <Link to="/" className="font-bold text-xl text-white">
        EventHub*
      </Link>

      <ul className="flex gap-5 cursor-pointer">
        <li>Pricing</li>
        <li>Help</li>
        <li>Terms</li>
        <li>Privacy</li>
      </ul>

      <div className="flex gap-2">
        <button className="rounded-full h-8 w-8 border">M</button>
        <button className="rounded-full h-8 w-8 border">I</button>
        <button className="rounded-full h-8 w-8 border">T</button>
      </div>
    </div>
  );
}

export default Footer;