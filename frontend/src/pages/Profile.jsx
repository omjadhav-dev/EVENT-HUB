import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { logout, updateUser } from "../store/authSlice";
import { logoutUser, updateUserProfile } from "../api/auth.api";
import { useToast } from "../context/useToast";
import { Pencil, Check, X } from "lucide-react";

function Profile() {
  const authStatus = useSelector((state) => state.auth.status);
  const userData = useSelector((state) => state.auth.userData);
  const bookings = useSelector((state) => state.bookings.list);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userData?.name || "");
  const [saving, setSaving] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // even if the request fails, clear local state so the UI doesn't
      // get stuck showing a logged-in user with an invalid session
    }
    dispatch(logout());
    navigate("/");
  };

  const startEditing = () => {
    setName(userData?.name || "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name can't be empty.");
      return;
    }

    setSaving(true);
    try {
      const res = await updateUserProfile({ name: name.trim() });
      dispatch(updateUser(res.data));
      setIsEditing(false);
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err.message || "Something went wrong while saving your profile.");
    } finally {
      setSaving(false);
    }
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

  const myBookingsCount = bookings.filter((b) => b.status !== "Cancelled").length;

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

              <p className="text-gray-500 text-xs mt-4">
                Account type ({userData?.userType}) can't be changed after signup.
              </p>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg font-semibold cursor-pointer disabled:opacity-50"
                >
                  <Check size={18} />
                  {saving ? "Saving..." : "Save"}
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
