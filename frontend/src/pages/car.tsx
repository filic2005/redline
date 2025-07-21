import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import AddServiceUpdate from "../components/addServiceUpdate";
import EditCarModal from "../components/editCar";

export default function Car() {
  const { carID } = useParams();
  const [car, setCar] = useState<any>(null);
  const [mods, setMods] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditCarModal, setShowEditCarModal] = useState(false);
  const [currentUserID, setCurrentUserID] = useState("");
  const navigate = useNavigate();

  const fetchCarData = useCallback(async () => {
    //Gather Car data in order of most recent to oldest
    const [{ data: carData }, { data: modData }, { data: updateData }] =
      await Promise.all([
        supabase.from("cars").select("*, users:userid(username)").eq("carid", carID).single(),
        supabase.from("mods").select("*").eq("carid", carID).order("mileage", { ascending: false }),
        supabase.from("serviceupdates").select("*").eq("carid", carID).order("createdat", { ascending: false }),
      ]);

    setCar(carData);
    setMods(modData || []);
    setUpdates(updateData || []);
    setLoading(false);
  }, [carID]);

  useEffect(() => {
    fetchCarData();
  }, [fetchCarData]);

  //Get the logged in user for permissions
  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setCurrentUserID(data.session?.user.id || "");
    };
    fetchSession();
  }, []);

  const handleDeleteCar = async (carID: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this car? This will also delete all service updates and mods.");
    if (!confirmDelete) return;

    const username = car?.users?.username;

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
      navigate(`/profile/${username}`);
    }
  };

  //Logic for Delete service update button
  const handleDeleteServiceUpdate = async (suid: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this service update? This will also delete any associated mods.");

    if (!confirmed) return;

    

    const { error } = await supabase
      .from("serviceupdates")
      .delete()
      .eq("suid", suid);

    if (error) {
      console.error("Failed to delete service update", error);
    } else {
      // re-fetch updates if needed
      fetchCarData();
    }
  };


  return (
  <div className="min-h-screen bg-black text-white px-4 py-8">
    {loading ? (
      <p className="text-center text-gray-400">Loading car...</p>
    ) : !car ? (
      <p className="text-center text-red-500 text-lg">Car not found.</p>
    ) : (
      <div className="max-w-3xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold">
            @{car.users.username}'s {car.year} {car.make} {car.model}
          </h1>
          <div className="flex gap-3">
            {currentUserID === car?.userid && (
              <>
                <button
                  onClick={() => setShowEditCarModal(true)}
                  className="bg-red-600 hover:bg-red-700 transition text-white px-4 py-2 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCar(car.carid)}
                  className="bg-red-600 hover:bg-red-700 transition text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Modifications */}
        <div className="bg-zinc-900 p-6 rounded-xl shadow">
          <h2 className="text-2xl font-semibold mb-4">Modifications</h2>
          {mods.length === 0 ? (
            <p className="text-gray-500">No mods installed.</p>
          ) : (
            <ul className="space-y-3">
              {mods.map((mod, i) => (
                <li key={i} className="bg-zinc-800 p-4 rounded">
                  <p className="text-sm text-gray-400 mb-1">
                    {mod.type} @ {mod.mileage} mi
                  </p>
                  <p className="font-semibold">{mod.name}</p>
                  <p className="text-sm mt-1 text-gray-300">{mod.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Service History */}
        <div className="bg-zinc-900 p-6 rounded-xl shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Service History</h2>
            {car?.userid === currentUserID && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-red-600 hover:bg-red-700 transition text-white px-4 py-2 rounded"
              >
                Add Update
              </button>
            )}
          </div>

          {updates.length === 0 ? (
            <p className="text-gray-500">No service updates yet.</p>
          ) : (
            <ul className="space-y-3">
              {updates.map((update, i) => (
                <li key={i} className="bg-zinc-800 p-4 rounded relative">
                  <p className="text-sm text-gray-400 mb-1">
                    {new Date(update.createdat).toLocaleDateString()}
                  </p>
                  <p className="mb-2">{update.description}</p>
                  <button
                    onClick={() => handleDeleteServiceUpdate(update.suid)}
                    className="absolute top-3 right-3 text-red-500 text-sm hover:underline"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    )}

    {showModal && (
      <AddServiceUpdate
        carID={carID}
        onClose={() => setShowModal(false)}
        onSave={() => fetchCarData()}
      />
    )}

    {showEditCarModal && (
      <EditCarModal
        carID={car.carid}
        currentData={{
          make: car.make,
          model: car.model,
          year: car.year,
          url: car.url,
          filename: car.filename,
        }}
        onClose={() => setShowEditCarModal(false)}
        onSave={({ make, model, year, url, filename }) => {
          setCar((prev: any) => ({
            ...prev,
            make,
            model,
            year,
            url,
            filename,
          }));
        }}
      />
    )}
  </div>
);

}
