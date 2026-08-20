import { Link } from "react-router-dom";

function Footer() {
  return (
    <div className="bg-gray-950 flex items-center justify-between px-6 py-4 text-white">
      <Link to="/" className="font-bold text-xl text-white hover:text-yellow-400">
        EventHub*
      </Link>

      <ul className="flex gap-5 cursor-pointer ">
        <li className="hover:text-yellow-400">Pricing</li>
        <li className="hover:text-yellow-400">Help</li>
        <li className="hover:text-yellow-400">Terms</li>
        <li className="hover:text-yellow-400">Privacy</li>
      </ul>

      <div className="flex gap-2">
        <button className="rounded-full h-8 w-8 border hover:text-yellow-400">M</button>
        <button className="rounded-full h-8 w-8 border hover:text-yellow-400">I</button>
        <button className="rounded-full h-8 w-8 border hover:text-yellow-400">T</button>
      </div>
    </div>
  );
}

export default Footer;