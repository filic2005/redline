import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

interface Props {
  onClose: () => void;
  onSave: () => void;
}

export default function CreatePostModal({ onClose, onSave }: Props) {
  const [caption, setCaption] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");


    const { data: session } = await supabase.auth.getSession();
    const userID = session.session?.user.id;

    if (!userID || !caption || images.length === 0) {
      setError("Caption and at least one image are required.");
      return;
    }

    const { data: postData, error: postError } = await supabase
      .from("posts")
      .insert([{ userid: userID, caption, createdat: new Date() }])
      .select()
      .single();

    if (postError || !postData) {
      console.error("Post creation failed", postError);
      setError("Failed to create post.");
      return;
    }

    const postid = postData.postid;

    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const ext = file.name.split(".").pop();
      const filePath = `post-${postid}-${Date.now()}-${i}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }

      const { data: urlData } = await supabase.storage
        .from("post-images")
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        console.error("Failed to get public URL");
        continue;
      }

      await supabase.from("images").insert({ postid, url: urlData.publicUrl });
    }

    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white text-black p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create New Post</h2>

        <label className="block mb-2 text-sm">Caption</label>
        <input
          type="text"
          placeholder="What's on your mind?"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />

        <label className="block mb-2 text-sm">Images</label>
        <div
          onClick={() => document.getElementById("file-upload")?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.length) {
              setImages(Array.from(e.dataTransfer.files));
            }
          }}
          className="w-full p-4 border border-dashed border-gray-400 rounded bg-gray-100 text-center text-sm mb-4 cursor-pointer"
        >
          {images.length > 0
            ? images.map((file) => file.name).join(", ")
            : "Click to select or drag & drop images"}
        </div>

        <input
          id="file-upload"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => setImages(Array.from(e.target.files || []))}
        />

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-gray-600">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
