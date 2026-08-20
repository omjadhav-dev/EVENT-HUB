import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import PublicLayout from "./layouts/PublicLayout";
import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Explore from "./pages/Explore";
import Event from "./pages/Event";
import MyEvents from "./pages/MyEvents";
import Create from "./pages/Create"
import EditEvent from "./pages/EditEvent"
import MyBookings from "./pages/MyBookings";
import Profile from "./pages/Profile";
import Analytics from "./pages/Analytics";

import { getCurrentUser } from "./api/auth.api";
import { login, authCheckFinished } from "./store/authSlice";

function App() {
  const dispatch = useDispatch();

  // The JWT lives in an httpOnly cookie, so the frontend can't just read
  // it - on every fresh page load we ask the backend "who am I?" (cookie
  // gets sent automatically) to restore the logged-in state.
  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        dispatch(login({ userData: res.data }));
      })
      .catch(() => {
        dispatch(authCheckFinished());
      });
  }, [dispatch]);

  return (
    <Routes>

      {/* Gradient Layout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Route>

      {/* Plain Layout */}
      <Route element={<MainLayout />}>
        <Route path="/explore" element={<Explore />} />
        <Route path="/event/:id" element={<Event />}/>
        <Route path="/myevents" element={<MyEvents/>}/>
        <Route path="/analytics" element={<Analytics/>}/>
        <Route path="/create" element={<Create/>}/>
        <Route path="/myevents/:eventId/edit" element={<EditEvent/>}/>
        <Route path="/mybookings" element={<MyBookings/>}/>
        <Route path="/profile" element={<Profile/>}/>
      </Route>

    </Routes>
  );
}

export default App;
