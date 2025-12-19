import { useState } from "react";
import { fetchUserByUsername } from "../api/users";
import { searchCars } from "../api/cars";
import { Search } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function SearchModal({ onClose }: Props) {
  const [type, setType] = useState<"users" | "cars">("users");
  const [query, setQuery] = useState("");
  const [cars, setCars] = useState<any[]>([]);
  const [username, setUsername] = useState("");
  const [userpfp, setUserPfp] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setError("");
    if (type === "users") {
      try {
        const userData = await fetchUserByUsername(query);
        setUsername(userData.username);
        setUserPfp(userData.url || "");
        setCars([]);
      } catch (err: any) {
        setUsername("");
        setUserPfp("");
        setCars([]);
        setError(err?.message || "User not found");
      }
    } else {
      if (!make && !model && !year) {
        setError("Add at least one filter to search cars.");
        return;
      }

      const parsedYear = year ? Number(year) : undefined;
      if (year && Number.isNaN(parsedYear)) {
        setError("Year must be a number");
        return;
      }

      try {
        const data = await searchCars({ make, model, year: parsedYear });
        setCars(data || []);
        setUsername("");
        setUserPfp("");
      } catch (err: any) {
        setError(err?.message || "Failed to search cars");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-zinc-900 text-white rounded-xl p-6 w-[90%] max-w-md max-h-[90vh] overflow-y-auto shadow-lg relative">
        <button onClick={onClose} className="absolute top-2 right-3 text-white text-xl font-bold">×</button>
        <h2 className="text-2xl font-bold mb-4 text-center">Search</h2>

        <div className="flex justify-between gap-2 mb-4">
          <button
            onClick={() => setType("users")}
            className={`flex-1 py-2 rounded-full ${type === "users" ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400"}`}
          >
            Users
          </button>
          <button
            onClick={() => setType("cars")}
            className={`flex-1 py-2 rounded-full ${type === "cars" ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400"}`}
          >
            Cars
          </button>
        </div>

        {type === "users" ? (
          <>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full mb-4 px-4 py-2 rounded-lg bg-zinc-800 text-white"
              placeholder="Enter username"
            />
          </>
        ) : (
          <div className="flex flex-col gap-3 mb-4">
            <input value={make} onChange={(e) => setMake(e.target.value)} className="px-4 py-2 rounded bg-zinc-800 text-white" placeholder="Make (required)" />
            <input value={model} onChange={(e) => setModel(e.target.value)} className="px-4 py-2 rounded bg-zinc-800 text-white" placeholder="Model" />
            <input value={year} onChange={(e) => setYear(e.target.value)} className="px-4 py-2 rounded bg-zinc-800 text-white" placeholder="Year" />
          </div>
        )}

        <div className="flex justify-center mb-6">
          <button
            onClick={handleSearch}
            className="bg-red-600 hover:bg-red-700 transition text-white p-3 rounded-full"
          >
            <Search size={24} />
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        {type === "users" && username && (
          <div onClick={() => window.location.href = `/profile/${username}`} className="flex items-center gap-4 p-4 rounded bg-zinc-800 cursor-pointer hover:bg-zinc-700">
            <img src={userpfp || "/images/default-pp.png"} className="w-10 h-10 rounded-full" />
            <p>@{username}</p>
          </div>
        )}

        {type === "cars" && cars.length > 0 && (
          <div className="flex flex-col gap-3">
            {cars.map((car) => (
              <div key={car.carid} onClick={() => window.location.href = `/car/${car.carid}`} className="flex items-center gap-3 p-3 bg-zinc-800 rounded cursor-pointer hover:bg-zinc-700">
                <img src={car.url || "/images/default-pp.png"} className="w-16 h-10 object-cover rounded" />
                <div>
                  <p className="text-white">
                    {car.make} {car.model} @{(Array.isArray(car.users) ? car.users[0]?.username : car.users?.username) || ""}
                  </p>
                  <p className="text-sm text-zinc-400">{car.year}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
