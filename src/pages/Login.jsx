import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();


    if (!email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    // Temporary user object
    // NOTE: This is only for frontend testing.
    // Once the backend is connected, DON'T dispatch the password.
    const user = {
      email,
      password,
    };

    dispatch(login(user));

    console.log("Logged In:", user);

    // ========================= FUTURE BACKEND STEPS =========================
    //
    // 1. Send login request to backend
    //
    // const response = await axios.post("/api/login", {
    //   email,
    //   password,
    // });
    //
    // 2. Backend verifies credentials
    //
    // 3. Backend returns:
    // {
    //   user: {
    //      id,
    //      name,
    //      email
    //   },
    //   token
    // }
    //
    // 4. Store token
    // localStorage.setItem("token", response.data.token);
    //
    // 5. Dispatch only user information
    //
    // dispatch(login(response.data.user));
    //
    // 6. Navigate to Home/Dashboard
    //
    // navigate("/");
    // ===============================================================
  };

  return (
    <div className="flex justify-center items-center py-25 px-4 mt-10 bg-gray-950">
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
            className="w-full bg-blue-600 hover:bg-blue-700 transition rounded-lg py-3 text-white font-semibold cursor-pointer"
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