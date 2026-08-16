import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { createEvent } from "../api/event.api";
import { useToast } from "../context/useToast";
import EventForm from "../components/EventForm";

function Create() {
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);
  const toast = useToast();

  if (!userData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4">
        <p className="text-gray-400">
          Register as a host to create and publish events.
        </p>
        <Link
          to="/signup"
          state={{ presetUserType: "host" }}
          className="bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl font-semibold"
        >
          Register as Host
        </Link>
      </div>
    );
  }

  if (userData.userType !== "Host") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4 text-center px-4">
        <p className="text-gray-400 max-w-md">
          You're signed in as an Attendee. Account type can't be changed after
          signup - create a new account and register as a Host to host events.
        </p>
        <Link
          to="/signup"
          state={{ presetUserType: "host" }}
          className="bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl font-semibold"
        >
          Register as Host
        </Link>
      </div>
    );
  }

  const handleCreate = async (values, imageFile) => {
    const res = await createEvent(values, imageFile);
    navigate(`/event/${res.data._id}`);
    toast.success("Your event is live!", { title: "Published" });
  };

  return (
    <EventForm
      onSubmit={handleCreate}
      submitLabel="Publish Event"
      cancelTo="/myevents"
      eyebrow="New Event"
      heading="Create your event"
    />
  );
}

export default Create;
