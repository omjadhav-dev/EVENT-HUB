import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function PublicLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-black flex flex-col">
      <Header />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default PublicLayout;