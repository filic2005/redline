import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

export default function Search() {
    const [query, setQuery] = useState("");
    const [type, setType] = useState<"users" | "cars">("users");
    const [cars, setCars] = useState<any[]>([]);
    const [username, setUsername] = useState("");
    const [userpfp, setUserPfp] = useState("");
    const [make, setMake] = useState("");
    const [model, setModel] = useState("");
    const [year, setYear] = useState("");   

  const handleSearch = async () => {
    if (type === "users") {
        const { data: userData, error } = await supabase
        .from("users")
        .select("userid, username, url")
        .eq("username", query)
        .single();

        if (error || !userData) {
        console.error("User not found", error);
        return;
        }

        setUsername(userData.username);
        setUserPfp(userData.url);
    } else {
        let query = supabase.from("cars").select("userid, carid, make, model, year, url, users:userid(username)");

        if (make) query = query.ilike("make", `%${make}%`);
        if (model) query = query.ilike("model", `%${model}%`);
        if (year) query = query.eq("year", year);

        const { data: carData, error } = await query;

        if (error || !carData?.length) {
        console.error("No cars found", error);
        return;
        }

        setCars(carData);
        }
    };


  return (
  <div className="p-6 max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-md">
    <h1 className="text-3xl font-bold text-center mb-6 text-zinc-800 dark:text-white">
      🔍 Search
    </h1>

    {/* Type Selector */}
    <div className="mb-4">
      <select
        value={type}
        onChange={(e) => {
          setType(e.target.value as "users" | "cars");
          setQuery("");
          setUsername("");
          setUserPfp("");
          setMake("");
          setModel("");
          setYear("");
          setCars([]);
        }}
        className="w-full px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white"
      >
        <option value="users">Search Users</option>
        <option value="cars">Search Cars</option>
      </select>
    </div>

    {/* Input Fields */}
    {type === "users" ? (
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 mb-4 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white"
        placeholder="Enter username"
      />
    ) : (
      <div className="flex flex-col gap-3 mb-4">
        <input
          value={make}
          onChange={(e) => setMake(e.target.value)}
          className="border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white"
          placeholder="Make (required)"
        />
        <input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white"
          placeholder="Model (optional)"
        />
        <input
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white"
          placeholder="Year (optional)"
        />
      </div>
    )}

    {/* Search Button */}
    <button
      onClick={handleSearch}
      className="w-full bg-red-600 hover:bg-red-700 transition text-white font-semibold py-3 rounded-xl mb-6 shadow-sm"
    >
      🔎 Search
    </button>

    {/* User Result */}
    {type === "users" && username && (
      <div onClick={() => window.location.href = `/profile/${username}`} className="flex items-center gap-4 border border-zinc-200 dark:border-zinc-700 p-4 rounded-xl shadow-sm bg-zinc-50 dark:bg-zinc-800">
        <img
          src={userpfp || "/images/default-pp.png"}
          alt={username}
          className="w-12 h-12 rounded-full object-cover"
        />
        <p className="text-lg font-semibold text-zinc-800 dark:text-white">@{username}</p>
      </div>
    )}

    {/* Car Results */}
    {type === "cars" && cars.length > 0 && (
      <div className="flex flex-col gap-4">
        {cars.map((car) => (
          <div
            key={car.carid}
            onClick={() => window.location.href = `/car/${car.carid}`}
            className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 flex items-center gap-4 bg-zinc-50 dark:bg-zinc-800 shadow-sm"
          >
            <img
              src={car.url || "/images/default-pp.png"}
              alt={`${car.make} ${car.model}`}
              className="w-24 h-14 object-cover rounded"
            />
            <div>
              <p className="font-semibold text-zinc-800 dark:text-white">
                {car.make} {car.model} @{car.users.username}
              </p>
              <p className="text-sm text-zinc-500">{car.year}</p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

}
