import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { logout, updateUser } from "../store/authSlice";
import { updateUserRecord } from "../store/usersSlice";
import { Pencil, Check, X } from "lucide-react";

function Profile() {
  const authStatus = useSelector((state) => state.auth.status);
  const userData = useSelector((state) => state.auth.userData);
  const bookings = useSelector((state) => state.bookings.list);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userData?.name || "");
  const [userType, setUserType] = useState(userData?.userType || "Attendee");

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const startEditing = () => {
    setName(userData?.name || "");
    setUserType(userData?.userType || "Attendee");
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert("Name can't be empty.");
      return;
    }

    const updates = { name: name.trim(), userType };

    // Keep the auth session and the stored account record in sync, so a
    // later log-out/log-in still reflects the edited name/type.
    dispatch(updateUser(updates));
    dispatch(updateUserRecord({ email: userData.email, updates }));

    setIsEditing(false);
  };

  if (!authStatus) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4">
        <p className="text-gray-400">Log in to view your profile.</p>
        <Link
          to="/login"
          className="bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl font-semibold"
        >
          Log In
        </Link>
      </div>
    );
  }

  const myBookingsCount = bookings.filter(
    (booking) => booking.userEmail === userData?.email,
  ).length;

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white px-12 py-10">
      <div className="max-w-3xl mx-auto mt-20">
        <div className="border border-gray-700 rounded-2xl bg-[#13131b] p-10 flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold uppercase shrink-0">
            {userData?.name?.charAt(0) || "T"}
          </div>

          {isEditing ? (
            <div className="flex-1">
              <label className="block text-gray-400 text-sm mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-violet-500"
              />

              <p className="text-gray-400 mt-3">{userData?.email}</p>

              <label className="block text-gray-400 text-sm mt-4 mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-xs">
                <button
                  type="button"
                  onClick={() => setUserType("Attendee")}
                  className={`py-2 rounded-lg border transition cursor-pointer ${
                    userType === "Attendee"
                      ? "bg-violet-600 text-white border-violet-600"
                      : "border-violet-600 text-violet-400 hover:bg-violet-600 hover:text-white"
                  }`}
                >
                  Attendee
                </button>

                <button
                  type="button"
                  onClick={() => setUserType("Organizer")}
                  className={`py-2 rounded-lg border transition cursor-pointer ${
                    userType === "Organizer"
                      ? "bg-violet-600 text-white border-violet-600"
                      : "border-violet-600 text-violet-400 hover:bg-violet-600 hover:text-white"
                  }`}
                >
                  Organizer
                </button>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg font-semibold cursor-pointer"
                >
                  <Check size={18} />
                  Save
                </button>

                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 border border-gray-700 hover:bg-gray-800 px-4 py-2 rounded-lg font-semibold cursor-pointer"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold capitalize">
                  {userData?.name}
                </h1>
                <p className="text-gray-400 mt-1">{userData?.email}</p>

                <span className="inline-block mt-3 bg-violet-900 text-violet-300 px-4 py-1 rounded-lg text-xs uppercase tracking-widest">
                  {userData?.userType}
                </span>
              </div>

              <button
                onClick={startEditing}
                className="flex items-center gap-2 border border-gray-700 hover:bg-gray-800 px-4 py-2 rounded-lg font-semibold cursor-pointer"
              >
                <Pencil size={16} />
                Edit
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6 mt-8">
          <div className="border border-gray-700 rounded-2xl p-6 bg-[#13131b]">
            <p className="uppercase tracking-widest text-gray-400 text-sm">
              Bookings
            </p>
            <h2 className="text-4xl font-bold mt-2">{myBookingsCount}</h2>
          </div>

          <div className="border border-gray-700 rounded-2xl p-6 bg-[#13131b]">
            <p className="uppercase tracking-widest text-gray-400 text-sm">
              Account Type
            </p>
            <h2 className="text-4xl font-bold mt-2">{userData?.userType}</h2>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          {userData?.userType === "Attendee" ? (
            <Link
              to="/mybookings"
              className="bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl font-semibold"
            >
              View My Bookings
            </Link>
          ) : (
            <Link
              to="/myevents"
              className="bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl font-semibold"
            >
              View My Events
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="border border-gray-700 hover:bg-gray-800 px-6 py-3 rounded-xl font-semibold cursor-pointer"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
