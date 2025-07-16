import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import { supabase } from "./utils/supabaseClient";
import AddPost from "./components/addPost";
import Feed from './pages/feed';
import Login from './pages/login';
import Profile from './pages/profile';
import Signup from './pages/signup';
import Garage from './pages/garage';
import Car from './pages/car';
import Navbar from "./components/navbar";
import Search from "./pages/search";

function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login" || location.pathname === "/signup";

  const [showAddModal, setShowAddModal] = useState(false);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Track login status
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleOpen = () => setShowAddModal(true);
    window.addEventListener("openAddPostModal", handleOpen);
    return () => window.removeEventListener("openAddPostModal", handleOpen);
  }, []);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={
          session ? <Navigate to="/feed" /> : <Navigate to="/login" />
        } />
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
