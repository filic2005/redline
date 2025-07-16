import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { Link } from "react-router-dom";
import AddCarModal from "../components/addCar";

export default function Garage() {
  const { username: routeUsername } = useParams();
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const fetchGarage = async () => {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("userid")
      .eq("username", routeUsername)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user:", userError);
      setLoading(false);
      return;
    }

    const garageUserId = userData.userid;

    // Check if logged-in user matches garage owner
    const { data: sessionData } = await supabase.auth.getSession();
    const loggedInUserId = sessionData.session?.user.id;
    setIsOwner(garageUserId === loggedInUserId);

    const { data: carsData, error: carsError } = await supabase
      .from("cars")
      .select("*")
      .eq("userid", garageUserId);

    if (carsError) {
      console.error("Error fetching cars:", carsError);
    } else {
      setCars(carsData || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchGarage();
  }, [routeUsername]);

  const handleDeleteCar = async (carID: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this car? This will also delete all service updates and mods.");
    if (!confirmDelete) return;

    // 1. Fetch car info (to get filename)
    const { data: carData, error: fetchError } = await supabase
      .from("cars")
      .select("filename")
      .eq("carid", carID)
      .single();

    if (fetchError) {
      console.error("Failed to fetch car info", fetchError);
      return;
    }

    // 2. Delete image from storage
    if (carData?.filename) {
      const { error: removeError } = await supabase.storage
        .from("car-pfp")
        .remove([carData.filename]);

      if (removeError) {
        console.warn("Failed to delete car image:", removeError);
      }
    }

    // 3. Delete car from DB (cascades to mods & updates if set up)
    const { error: deleteError } = await supabase
      .from("cars")
      .delete()
      .eq("carid", carID);

    if (deleteError) {
      console.error("Failed to delete car", deleteError);
    } else {
      console.log("Car deleted successfully");
      fetchGarage(); // refresh car list
    }
  };



  return (
    <div className="p-6 text-white">
      <Link
        to={`/profile/${routeUsername}`}
        className="text-sm text-gray-400 hover:text-white flex items-center mb-4 transition"
      >
        <span className="mr-1 text-lg">←</span> Back to profile
      </Link>

      <h1 className="text-3xl font-bold mb-8 flex items-center justify-between">
        <span>@{routeUsername}'s Garage</span>
        {isOwner && (
          <span>
            <button onClick={() => setShowAddCarModal(true)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
              Add Car
            </button>
          </span>
        )}
      </h1>

      {loading ? (
        <p>Loading...</p>
      ) : cars.length === 0 ? (
        <p className="text-gray-400">No cars in this garage yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {cars.map((car, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-transform duration-300 relative group"
            >
              <Link to={`/car/${car.carid}`}>
                <img
                  src={car.url || "/images/default-pp.png"}
                  alt="Car"
                  className="w-full h-48 object-cover"
                />
              </Link>

              <div className="p-4 text-center">
                <p className="text-lg font-semibold">
                  {car.year} {car.make} {car.model}
                </p>
              </div>

              {isOwner && (
                <button
                  onClick={() => handleDeleteCar(car.carid)}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                >
                  Delete
                </button>
              )}
            </div>

          ))}
        </div>
      )}

      {showAddCarModal && (
        <AddCarModal
          onClose={() => setShowAddCarModal(false)}
          onSave={() => {
            setShowAddCarModal(false);
            fetchGarage(); // re-fetch to show new car
          }}
        />
      )}
    </div>
  );
}
