import { Routes, Route } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import Explore from "./pages/Explore";

function App() {
  return (
    <Routes>

      {/* Gradient Layout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* Plain Layout */}
      <Route element={<MainLayout />}>
        <Route path="/explore" element={<Explore />} />
      </Route>

    </Routes>
  );
}

export default App;