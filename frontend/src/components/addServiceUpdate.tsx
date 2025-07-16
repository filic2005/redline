import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

interface Props {
  carID: string | undefined;
  onClose: () => void;
  onSave: () => void;
}

export default function AddServiceUpdate({ carID, onClose, onSave }: Props) {
  const [description, setDescription] = useState("");
  const [mods, setMods] = useState([
    { name: "", type: "", mileage: "", description: "" },
  ]);
  const [error, setError] = useState("");

  const handleAddMod = () => {
    setMods([...mods, { name: "", type: "", mileage: "", description: "" }]);
  };

  const handleModChange = (index: number, field: string, value: string) => {
    const updated = [...mods];
    updated[index][field as keyof typeof updated[0]] = value;
    setMods(updated);
  };

  const handleSave = async () => {
    setError("");

    if (!description.trim()) {
        setError("Service update description is required.");
        return;
    }

    // Insert the service update
    const { data: serviceData, error: serviceError } = await supabase
        .from("serviceupdates")
        .insert([{ carid: carID, description }])
        .select()
        .single();

    if (serviceError || !serviceData) {
        setError("Failed to add service update.");
        return;
    }

    const suid = serviceData.suid;

    const modInserts = mods.filter(mod => mod.name.trim()).map(mod => ({
        ...mod,
        suid,
        carid: carID,
        mileage: parseInt(mod.mileage || "0"),
    }));

    if (modInserts.length > 0) {
        const { error: modError } = await supabase.from("mods").insert(modInserts);

        if (modError) {
        // Roll back the service update
        await supabase.from("serviceupdates").delete().eq("suid", suid);
        setError("Failed to save mods. Service update was rolled back.");
        return;
        }
    }

    onSave();
    onClose();
    };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4 text-black">Add Service Update</h2>

        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded p-2 text-black mb-4"
        />

        <h3 className="text-lg font-semibold text-black mb-2">Mods</h3>
        {mods.map((mod, i) => (
          <div key={i} className="border rounded p-3 mb-4 bg-gray-100">
            <input
              value={mod.name}
              onChange={(e) => handleModChange(i, "name", e.target.value)}
              placeholder="Name"
              className="w-full p-2 mb-2 rounded border text-black"
            />
            <input
              value={mod.type}
              onChange={(e) => handleModChange(i, "type", e.target.value)}
              placeholder="Type"
              className="w-full p-2 mb-2 rounded border text-black"
            />
            <input
              value={mod.mileage}
              onChange={(e) => handleModChange(i, "mileage", e.target.value)}
              placeholder="Mileage"
              type="number"
              className="w-full p-2 mb-2 rounded border text-black"
            />
            <textarea
              value={mod.description}
              onChange={(e) => handleModChange(i, "description", e.target.value)}
              placeholder="Description"
              className="w-full p-2 mb-2 rounded border text-black"
            />
          </div>
        ))}

        <button
          onClick={handleAddMod}
          className="bg-gray-300 hover:bg-gray-400 text-black px-3 py-2 rounded mb-4"
        >
          Add Another Mod
        </button>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-gray-600">Cancel</button>
          <button onClick={handleSave} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
