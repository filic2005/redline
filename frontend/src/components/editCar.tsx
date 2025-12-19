import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { updateCar } from "../api/cars";

interface Props {
  carID: string;
  currentData: {
    make: string;
    model: string;
    year: number;
    url: string | null;
    filename: string | null;
  };
  onClose: () => void;
  onSave: (updated: { make: string; model: string; year: number; url: string; filename: string }) => void;
}

export default function EditCarModal({ carID, currentData, onClose, onSave }: Props) {
  const [make, setMake] = useState(currentData.make);
  const [model, setModel] = useState(currentData.model);
  const [year, setYear] = useState(currentData.year);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(currentData.url || "");

  const handleSave = async () => {
    let uploadedUrl = previewUrl;
    let uploadedFilename = currentData.filename || "";

    // Step 1: Remove old image if uploading a new one
    if (file && currentData.filename) {
      const { error: removeError } = await supabase.storage
        .from("car-pfp")
        .remove([currentData.filename]);

      if (removeError) {
        console.warn("Failed to delete old car image:", removeError);
      }
    }

    // Step 2: Upload new image if selected
    if (file) {
      const fileExt = file.name.split(".").pop();
      const filename = `car-${carID}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("car-pfp")
        .upload(filename, file);

      if (uploadError) {
        console.error("Failed to upload car image", uploadError);
        return;
      }

      const { data } = supabase.storage.from("car-pfp").getPublicUrl(filename);
      if (!data?.publicUrl) return;

      uploadedUrl = `${data.publicUrl}?t=${Date.now()}`;
      uploadedFilename = filename;
    }

    try {
      await updateCar(carID, {
        make,
        model,
        year,
        url: uploadedUrl,
        filename: uploadedFilename,
      });
      onSave({ make, model, year, url: uploadedUrl, filename: uploadedFilename });
      onClose();
    } catch (err) {
      console.error("Failed to update car", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md border border-zinc-700 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-white">Edit Car Info</h2>

        <label className="block text-sm font-medium mb-1 text-gray-300">Make</label>
        <input
          type="text"
          value={make}
          onChange={(e) => setMake(e.target.value)}
          className="w-full p-2 border border-zinc-600 rounded mb-3 bg-zinc-800 text-white"
        />

        <label className="block text-sm font-medium mb-1 text-gray-300">Model</label>
        <input
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full p-2 border border-zinc-600 rounded mb-3 bg-zinc-800 text-white"
        />

        <label className="block text-sm font-medium mb-1 text-gray-300">Year</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="w-full p-2 border border-zinc-600 rounded mb-4 bg-zinc-800 text-white"
        />

        <label className="block text-sm font-medium mb-1 text-gray-300">Car Picture</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const selected = e.target.files?.[0] || null;
            setFile(selected);
            if (selected) setPreviewUrl(URL.createObjectURL(selected));
          }}
          className="w-full p-2 border border-zinc-600 rounded mb-4 bg-zinc-800 text-white"
        />

        {previewUrl && (
          <img
            src={previewUrl}
            alt="Car Preview"
            className="w-40 h-40 object-cover rounded mx-auto mb-4"
          />
        )}

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
