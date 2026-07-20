import React from "react";

function Login() {
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

        <form className="space-y-5">

          <div>
            <label className="block text-gray-300 mb-2">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
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
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <button
            className="w-full bg-blue-600 hover:bg-blue-700 transition rounded-lg py-3 text-white font-semibold cursor-pointer"
          >
            Log In
          </button>

          <div className="text-center text-gray-400">
            Don't have an account?{" "}
            <a
              href=""
              className="text-blue-500 hover:text-blue-400 font-medium"
            >
              Sign Up
            </a>
          </div>

        </form>
      </div>
    </div>
  );
}

export default Login;