import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

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

    // Step 3: Update car row
    const { error } = await supabase
      .from("cars")
      .update({
        make,
        model,
        year,
        url: uploadedUrl,
        filename: uploadedFilename,
      })
      .eq("carid", carID);

    if (!error) {
      onSave({ make, model, year, url: uploadedUrl, filename: uploadedFilename });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-black">Edit Car Info</h2>

        <label className="block text-sm font-medium mb-1 text-gray-700">Make</label>
        <input
          type="text"
          value={make}
          onChange={(e) => setMake(e.target.value)}
          className="w-full p-2 border rounded mb-3 text-black"
        />

        <label className="block text-sm font-medium mb-1 text-gray-700">Model</label>
        <input
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full p-2 border rounded mb-3 text-black"
        />

        <label className="block text-sm font-medium mb-1 text-gray-700">Year</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="w-full p-2 border rounded mb-4 text-black"
        />

        <label className="block text-sm font-medium mb-1 text-gray-700">Car Picture</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const selected = e.target.files?.[0] || null;
            setFile(selected);
            if (selected) setPreviewUrl(URL.createObjectURL(selected));
          }}
          className="w-full p-2 border rounded mb-4 text-black bg-white"
        />

        {previewUrl && (
          <img
            src={previewUrl}
            alt="Car Preview"
            className="w-40 h-40 object-cover rounded mx-auto mb-4"
          />
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-gray-600">Cancel</button>
          <button onClick={handleSave} className="bg-red-600 text-white px-4 py-2 rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}