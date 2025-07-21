import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import { supabase } from "./utils/supabaseClient";
import type { Session } from "@supabase/supabase-js";
import AddPost from "./components/addPost";
import AddCar from "./components/addCar";
import Feed from './pages/feed';
import Login from './pages/login';
import Profile from './pages/profile';
import Signup from './pages/signup';
import Car from './pages/car';
import Navbar from "./components/navbar";

function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login" || location.pathname === "/signup";

  const [showAddPostModal, setShowAddPostModal] = useState(false);
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
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
    const handleOpen = () => setShowAddPostModal(true);
    window.addEventListener("openAddPostModal", handleOpen);
    return () => window.removeEventListener("openAddPostModal", handleOpen);
  }, []);

  useEffect(() => {
    const handleOpen = () => setShowAddCarModal(true);
    window.addEventListener("openAddCarModal", handleOpen);
    return () => window.removeEventListener("openAddCarModal", handleOpen);
  }, []);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-zinc-900 text-white">

      <Routes>
        <Route path="/" element={
          session ? <Navigate to="/feed" /> : <Navigate to="/login" />
        } />
        <Route path="/feed" element={<Feed />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/car/:carID" element={<Car />} />
      </Routes>

      {!hideNavbar && <Navbar />}

      {showAddPostModal && (
        <AddPost
          onClose={() => setShowAddPostModal(false)}
          onSave={() => setShowAddPostModal(false)}
        />
      )}

      {showAddCarModal && (
        <AddCar
          onClose={() => setShowAddCarModal(false)}
          onSave={() => { setShowAddCarModal(false); }}
        />
      )}
    </div>
  );
}

export default App;
