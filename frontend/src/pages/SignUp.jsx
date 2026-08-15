import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { registerUser } from "../api/auth.api";
import { getStates, getCities } from "../api/locationApi";
import { useToast } from "../context/useToast";

function SignUp() {
  const location = useLocation();
  const toast = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState(
    location.state?.presetUserType === "host" ? "host" : "",
  );
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    getStates()
      .then(setStates)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedState) return;
    getCities(selectedState)
      .then(setCities)
      .catch(() => {});
  }, [selectedState]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !userType) {
      setError("Please fill all the fields.");
      return;
    }

    // Matches the backend's User model enum: ["Attendee", "Host"]
    const backendUserType = userType === "attendee" ? "Attendee" : "Host";

    setSubmitting(true);
    try {
      await registerUser({
        name,
        email,
        password,
        userType: backendUserType,
        state: selectedState,
        city: selectedCity,
      });
      toast.success("Account created - you can log in now.", { title: "Welcome!" });
      navigate("/login");
    } catch (err) {
      setError(err.message || "Something went wrong while signing up.");
    } finally {
      setSubmitting(false);
    }
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

        {error && (
          <div className="mb-5 rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}

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


          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 mb-2">
                State
              </label>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedCity("");
                  setCities([]);
                }}
                className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-white outline-none focus:border-blue-500"
              >
                <option value="">Select state</option>
                {states.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">
                City
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!selectedState}
                className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-white outline-none focus:border-blue-500 disabled:opacity-50"
              >
                <option value="">Select city</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-gray-500 text-xs -mt-3">
            Used to show you events happening near you.
          </p>


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
            disabled={submitting}
            className="w-full bg-yellow-600 hover:bg-yellow-700 transition rounded-lg py-3 text-white font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating Account..." : "Create Account"}
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
