import { useState } from "react";
import { createServiceUpdate } from "../api/serviceUpdates";

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

    if (!carID) {
      setError("Missing car reference.");
      return;
    }

    try {
      const payload = mods
        .filter((mod) => mod.name.trim())
        .map((mod) => ({
          name: mod.name,
          type: mod.type,
          description: mod.description,
          mileage: parseInt(mod.mileage || "0", 10),
        }));

      await createServiceUpdate({
        carID,
        description,
        mods: payload,
      });
    } catch (err) {
      setError("Failed to add service update.");
      return;
    }

    onSave();
    onClose();
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-xl overflow-y-auto max-h-[90vh] border border-zinc-700 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-white">Add Service Update</h2>

        <label className="block text-sm font-medium text-gray-300">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-zinc-700 rounded p-2 text-white bg-zinc-800 mb-4"
        />

        <h3 className="text-lg font-semibold text-white mb-2">Mods</h3>
        {mods.map((mod, i) => (
          <div key={i} className="border border-zinc-700 rounded p-3 mb-4 bg-zinc-800">
            <input
              value={mod.name}
              onChange={(e) => handleModChange(i, "name", e.target.value)}
              placeholder="Name"
              className="w-full p-2 mb-2 rounded border border-zinc-600 bg-zinc-900 text-white"
            />
            <input
              value={mod.type}
              onChange={(e) => handleModChange(i, "type", e.target.value)}
              placeholder="Type"
              className="w-full p-2 mb-2 rounded border border-zinc-600 bg-zinc-900 text-white"
            />
            <input
              value={mod.mileage}
              onChange={(e) => handleModChange(i, "mileage", e.target.value)}
              placeholder="Mileage"
              type="number"
              className="w-full p-2 mb-2 rounded border border-zinc-600 bg-zinc-900 text-white"
            />
            <textarea
              value={mod.description}
              onChange={(e) => handleModChange(i, "description", e.target.value)}
              placeholder="Description"
              className="w-full p-2 mb-2 rounded border border-zinc-600 bg-zinc-900 text-white"
            />
          </div>
        ))}

        <button
          onClick={handleAddMod}
          className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-2 rounded mb-4"
        >
          Add Another Mod
        </button>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-gray-400 hover:text-red-500">Cancel</button>
          <button onClick={handleSave} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );

}
