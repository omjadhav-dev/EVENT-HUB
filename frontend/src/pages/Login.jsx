import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";
import { loginUser } from "../api/auth.api";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await loginUser({ email, password });

      // authSlice's "login" reducer reads action.payload.userData,
      // so the user object must be wrapped like this.
      dispatch(login({ userData: res.data }));

      // Both Attendees and Hosts land on the home page after logging in.
      navigate("/");
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-25 px-4 mt-10">
      <div className="w-full max-w-md bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Welcome Back
          </h1>

          <p className="text-gray-400 mt-2">
            Log in to book events and manage your tickets
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-300 mb-2">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-yellow-600 hover:bg-yellow-700 transition rounded-lg py-3 text-white font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Logging In..." : "Log In"}
          </button>

          <div className="text-center text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-500 hover:text-blue-400 font-medium"
            >
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
