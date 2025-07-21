import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

interface Props {
  onClose: () => void;
  onSave: () => void;
}

export default function AddCar({ onClose, onSave }: Props) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");

    if (!make || !model || !year) {
      setError("Make, model, and year are required.");
      return;
    }

    const { data: session } = await supabase.auth.getSession();
    const userID = session.session?.user.id;
    if (!userID) {
      setError("You must be logged in to add a car.");
      return;
    }

    let imageUrl = null;
    let imageFilename = null;

    if (file) {
      const ext = file.name.split(".").pop();
      const filename = `pfp-${userID}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("car-pfp")
        .upload(filename, file);

      if (uploadError) {
        console.error("Image upload error:", uploadError);
        setError("Failed to upload image.");
        return;
      }

      const { data } = supabase.storage.from("car-pfp").getPublicUrl(filename);
      if (!data?.publicUrl) {
        setError("Failed to get public image URL.");
        return;
      }

      imageUrl = data.publicUrl;
      imageFilename = filename;
    }

    const { error: insertError } = await supabase.from("cars").insert({
      make,
      model,
      year: parseInt(year),
      url: imageUrl,
      filename: imageFilename,
      userid: userID,
    });

    if (insertError) {
      console.error("Car insert error:", insertError);
      setError("Failed to add car.");
    } else {
      onSave();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-zinc-900 text-white rounded-xl p-6 w-[90%] max-w-md max-h-[90vh] overflow-y-auto shadow-lg relative">
        <h2 className="text-xl font-bold mb-4">Add New Car</h2>

        <input
          type="text"
          placeholder="Make"
          value={make}
          onChange={(e) => setMake(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="text"
          placeholder="Model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />

        <label className="block mb-2 text-sm">Car Photo (optional)</label>
        <div
          onClick={() => document.getElementById("file-upload")?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
          }}
          className="w-full mb-3 p-2 border rounded"
        >
          {file ? file.name : "Click to select or drag & drop an image"}
        </div>

        <input
          id="file-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
