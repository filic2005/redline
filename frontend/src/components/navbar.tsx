import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { useEffect, useState } from "react";
import SearchModal from "./SearchModal";
import AddPost from "./addPost";
import AddCar from "./addCar";
import { Search, PlusCircle, CarFront, UserCircle, LogOut } from "lucide-react";

export default function Navbar() {
  const [username, setUsername] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showAddPostModal, setShowAddPostModal] = useState(false);
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setUsername(parsed.username);
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
  }, []);

  useEffect(() => {
    const openPost = () => setShowAddPostModal(true);
    const openCar = () => setShowAddCarModal(true);
    window.addEventListener("openAddPostModal", openPost);
    window.addEventListener("openAddCarModal", openCar);
    return () => {
        window.removeEventListener("openAddPostModal", openPost);
        window.removeEventListener("openAddCarModal", openCar);
    };
    }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    navigate("/login");
  };

  const path = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-black border-t border-red-600 text-white px-4 py-3 shadow-md flex justify-center justify-between items-center">
      <div className="flex items-center gap-5 sm:gap-6 text-base">

        <button onClick={() => setShowAddPostModal(true)}>
            <PlusCircle size={26} />
        </button>

        <button onClick={() => setShowAddCarModal(true)}>
            <CarFront size={26} />
        </button>

        {/* Home / Feed */}
        <Link
          to="/feed"
          className={`transition ${path === "/feed" ? "outline outline-1 outline-red-500 rounded" : "outline-red-500"} hover:outline hover:outline-2 hover:outline-red-500 rounded`}
          title="Feed"
        >
          <img
            src={"/images/redline_R.png"}
            alt="Redline"
            className="w-7 h-7"
          />
        </Link>

        {/* Search */}
        <button onClick={() => setShowSearch(true)} className="text-white hover:text-red-500">
            <Search size={26} />
        </button>

        {/* Profile */}
        <Link
          to={`/profile/${username}`}
          className={`transition ${path.startsWith("/profile") ? "text-red-500" : "text-white"} hover:text-red-500`}
          title="Profile"
        >
          <UserCircle size={26} />
        </Link>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="text-white hover:text-red-500 transition"
          title="Sign Out"
        >
          <LogOut size={26} />
        </button>
      </div>
        {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
        {showAddPostModal && (
            <AddPost
                onClose={() => setShowAddPostModal(false)}
                onSave={() => {
                    setShowAddPostModal(false);
                    window.location.reload();
                }}
            />
        )}

        {showAddCarModal && (
            <AddCar
                onClose={() => setShowAddCarModal(false)}
                onSave={() => {
                    setShowAddCarModal(false);
                    window.location.reload();
                }}   
            />
        )}
    </nav>
  );
}
