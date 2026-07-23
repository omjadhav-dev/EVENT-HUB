import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../store/authSlice";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const users = useSelector((state) => state.users.list);

  const handleSubmit = (e) => {
    e.preventDefault();


    if (!email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    // Look the account up instead of asking the person whether they're an
    // Attendee or Organizer - that was decided when they signed up.
    const matchedUser = users.find(
      (u) => u.email === email && u.password === password,
    );

    if (!matchedUser) {
      alert(
        "Invalid email or password. If you don't have an account yet, please sign up first.",
      );
      return;
    }

    const user = {
      name: matchedUser.name,
      email: matchedUser.email,
      userType: matchedUser.userType,
    };

    // authSlice's "login" reducer reads action.payload.userData,
    // so the user object must be wrapped like this.
    dispatch(login({ userData: user }));

    console.log("Logged In:", user);

    // Both Attendees and Organizers land on the home page after logging in
    // - the header alone used to update while the page stayed put.
    navigate("/");

    // ========================= FUTURE BACKEND STEPS =========================
    //
    // 1. Send login request to backend
    //
    // const response = await axios.post("/api/login", {
    //   email,
    //   password,
    // });
    //
    // 2. Backend verifies credentials and returns the user's userType
    //
    // 3. Backend returns:
    // {
    //   user: {
    //      id,
    //      name,
    //      email,
    //      userType
    //   },
    //   token
    // }
    //
    // 4. Store token
    // localStorage.setItem("token", response.data.token);
    //
    // 5. Dispatch only user information
    //
    // dispatch(login({ userData: response.data.user }));
    //
    // 6. Navigate to Home/Dashboard
    //
    // navigate("/");
    // ===============================================================
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
            className="w-full bg-yellow-600 hover:bg-yellow-700 transition rounded-lg py-3 text-white font-semibold cursor-pointer"
          >
            Log In
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
