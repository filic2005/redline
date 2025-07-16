import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from "react";
import AddPost from "./components/addPost";
import Feed from './pages/feed';
import Login from './pages/login';
import Profile from './pages/profile';
import Signup from './pages/signup'
import Garage from './pages/garage'
import Car from './pages/car';
import Navbar from "./components/navbar";
import Search from "./pages/search"


function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login" || location.pathname === "/signup";

  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const handleOpen = () => setShowAddModal(true);
    window.addEventListener("openAddPostModal", handleOpen);
    return () => window.removeEventListener("openAddPostModal", handleOpen);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/search" element={<Search />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/garage/:username" element={<Garage />} />
        <Route path="/car/:carID" element={<Car />} />
      </Routes>

      {showAddModal && (
        <AddPost
          onClose={() => setShowAddModal(false)}
          onSave={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}


export default App;