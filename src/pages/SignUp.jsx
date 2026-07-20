import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function SignUp() {
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

 
    if (!name || !email || !password || !userType) {
      alert("Please fill all the fields.");
      return;
    }

    // Temporary User Object
    // This is only for frontend testing.
    const user = {
      name,
      email,
      password,
      userType,
    };

    console.log("User Registered:", user);

    // ==========================================================
    //               FUTURE BACKEND INTEGRATION
    // ==========================================================

    // 1. Send POST request to backend
    //
    // const response = await axios.post("/api/signup", {
    //   name,
    //   email,
    //   password,
    //   userType,
    // });

    // 2. Backend validates the data

    // 3. Backend creates a new user in MongoDB

    // 4. Backend sends response
    //
    // {
    //    success: true,
    //    message: "Account Created Successfully"
    // }

    // 5. If successful, navigate to Login page
    //
    // navigate("/login");

    // ==========================================================

    // Temporary Navigation
    navigate("/login");
  };

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

        <form className="space-y-5" onSubmit={handleSubmit}>
        
          <div>
            <label className="block text-gray-300 mb-2">
              Name
            </label>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                onClick={() => setUserType("attendee")}
                className={`py-3 rounded-lg border transition cursor-pointer ${
                  userType === "attendee"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                }`}
              >
                Attend Events
              </button>

              <button
                type="button"
                onClick={() => setUserType("host")}
                className={`py-3 rounded-lg border transition cursor-pointer ${
                  userType === "host"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                }`}
              >
                Host Events
              </button>
            </div>
          </div>

         
          <button
            type="submit"
            className="w-full bg-yellow-600 hover:bg-yellow-700 transition rounded-lg py-3 text-white font-semibold cursor-pointer"
          >
            Create Account
          </button>

        
          <p className="text-center text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-500 hover:text-blue-400 font-medium"
            >
              Log In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignUp;