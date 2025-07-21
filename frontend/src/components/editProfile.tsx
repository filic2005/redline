import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

interface Props {
  currentBio: string;
  currentPfp: string | null;
  currentFilename: string | null;
  onClose: () => void;
  onSave: (updated: { bio: string; url: string; filename: string }) => void;
}

export default function EditProfile({
  currentBio,
  currentPfp,
  currentFilename,
  onClose,
  onSave,
}: Props) {
  const [bio, setBio] = useState(currentBio);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(currentPfp || "");

  const handleSave = async () => {
    const { data: session } = await supabase.auth.getSession();
    const userID = session.session?.user.id;
    if (!userID) return;

    let uploadedUrl = previewUrl;
    let uploadedFilename = currentFilename || "";

    if (file) {
      // Step 1: Delete old file if exists and not default
      if (currentFilename) {
        const { error: removeError } = await supabase.storage
          .from("user-pfp")
          .remove([currentFilename]);

        if (removeError) {
          console.warn("Failed to delete old profile image:", removeError);
        }
      }

      // Step 2: Upload new file
      const fileExt = file.name.split(".").pop();
      const filename = `pfp-${userID}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("user-pfp")
        .upload(filename, file);

      if (uploadError) {
        console.error("Failed to upload image", uploadError);
        return;
      }

      // Step 3: Get public URL
      const { data } = supabase.storage.from("user-pfp").getPublicUrl(filename);
      if (!data?.publicUrl) return;

      uploadedUrl = `${data.publicUrl}?t=${Date.now()}`; // cache busting
      uploadedFilename = filename;
    }

    // Step 4: Update user row
    const { error } = await supabase
      .from("users")
      .update({ bio, url: uploadedUrl, filename: uploadedFilename })
      .eq("userid", userID);

    if (!error) {
      onSave({ bio, url: uploadedUrl, filename: uploadedFilename });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md shadow-lg border border-zinc-700">
        <h2 className="text-xl font-bold mb-4 text-white">Edit Profile</h2>

        <label className="block mb-2 text-sm text-gray-300">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white mb-4 resize-none"
        />

        <label className="block mb-2 text-sm text-gray-300">Profile Picture</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const selected = e.target.files?.[0] || null;
            setFile(selected);
            if (selected) setPreviewUrl(URL.createObjectURL(selected));
          }}
          className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white mb-4"
        />

        {previewUrl && (
          <img
            src={previewUrl}
            alt="Preview"
            className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
          />
        )}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="text-gray-400 hover:text-red-500">
            Cancel
          </button>
          <button onClick={handleSave} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );

}
