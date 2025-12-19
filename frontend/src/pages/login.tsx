import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { ensureUserProfile } from "../api/users";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const user = signInData.session?.user;

    if (!user) {
      setError("Login succeeded, but no user session found.");
      setLoading(false);
      return;
    }

    const profileUsername = user.user_metadata?.username || email.split("@")[0];
    try {
      const ensuredProfile = await ensureUserProfile({
        username: profileUsername,
        email: user.email || email,
      });

      localStorage.setItem("user", JSON.stringify(ensuredProfile));
      navigate(`/profile/${ensuredProfile.username}`);
    } catch (err: any) {
      console.error("Failed to load profile from backend", err);
      setError(err?.message || "Login succeeded, but failed to load your profile.");
      setLoading(false);
      return;
    }

    setLoading(false);
  };


  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-black text-white">
      {/* Left image section */}
      <div className="hidden md:flex items-center justify-center w-full h-full p-4">
        <img
          src="/images/redline3.png"
          alt="Redline Tachometer"
          className="max-w-[90%] max-h-[90%] object-contain rounded-lg"
        />
      </div>

      {/* Right login form */}
      <div className="w-full md:w-[900px] p-8 flex flex-col justify-center items-center">
        <h1 className="text-4xl font-redline text-red-600 mb-8 tracking-wider">Redline</h1>

        <form onSubmit={handleLogin} className="w-full space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 transition-colors duration-200 py-2 rounded-md font-semibold tracking-wide"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <a href="#" className="mt-4 text-sm text-gray-400 hover:underline">
          Forgot password?
        </a>
        <div className="mt-6 text-sm text-gray-400">
          Don't have an account?{" "}
          <a href="/signup" className="text-red-500 hover:underline">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
