import { Routes, Route } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Explore from "./pages/Explore";
import Event from "./pages/Event";

function App() {
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
      </Route>

    </Routes>
  );
}

export default App;