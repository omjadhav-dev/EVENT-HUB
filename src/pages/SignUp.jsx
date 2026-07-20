import React from "react";

function SignUp() {
  return (
    <div className="flex justify-center items-center py-20 px-4 mt-10">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Join Event Hub
          </h1>

          <p className="text-gray-400 mt-2">
            Attend, host, and never miss a great tech event.
          </p>
        </div>

        <form className="space-y-5">

          <div>
            <label className="block text-gray-300 mb-2">
              Name
            </label>

            <input
              type="text"
              placeholder="Enter your name"
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-3">
              I Want To
            </label>

            <div className="grid grid-cols-2 gap-3">

              <button
                type="button"
                className="py-3 cursor-pointer rounded-lg border border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white transition"
              >
                Attend Events
              </button>

              <button
                type="button"
                className="py-3 cursor-pointer rounded-lg border border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white transition"
              >
                Host Events
              </button>

            </div>
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 transition rounded-lg py-3 text-white font-semibold"
          >
            Create Account
          </button>

          <p className="text-center text-gray-400">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-500 hover:text-blue-400 font-medium"
            >
              Log In
            </a>
          </p>

        </form>

      </div>
    </div>
  );
}

export default SignUp;