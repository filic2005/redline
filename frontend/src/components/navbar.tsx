import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { useEffect, useState } from "react";

export default function Navbar() {
    const [username, setUsername] = useState<string | null>(null);

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

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <nav className="bg-gray-900 text-white px-4 py-3 shadow-md flex flex-wrap justify-center justify-between items-center gap-3 sm:gap-4">
            <Link to="/feed" className="text-xl font-bold mr-auto">Redline</Link>
            <div className="flex flex-wrap justify-end items-center gap-2 sm:gap-4 text-base">
                <button
                onClick={() => window.dispatchEvent(new Event("openAddPostModal"))}
                className="text-xl text-white hover:text-red-500 transition"
                title="New Post"
                >
                +
                </button>
                <Link to="/search" className="hover:underline text-lg">🔍</Link>
                <Link to="/feed" className="hover:underline">Feed</Link>
                <Link to={`/profile/${username}`} className="hover:underline">Profile</Link>
                <Link to={`/garage/${username}`} className="hover:underline">Garage</Link>
                <button
                onClick={handleSignOut}
                className="text-sm text-gray-300 hover:text-red-500"
                >
                Sign Out
                </button>
            </div>
        </nav>

    );
}