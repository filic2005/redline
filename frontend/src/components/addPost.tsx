import { useState } from "react";
import { supabase } from "../utils/supabaseClient";

interface Props {
  onClose: () => void;
  onSave: (newPost: any) => void;
}

export default function AddPost({ onClose, onSave }: Props) {
  const [caption, setCaption] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState("");

  const handleFileSelect = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    setImages(fileArray);

    const urls = fileArray.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

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

    onSave(postData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-zinc-900 text-white rounded-xl p-6 w-[90%] max-w-md max-h-[90vh] overflow-y-auto shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-white text-xl font-bold"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center">Create New Post</h2>

        <label className="block mb-2 text-sm">Caption</label>
        <input
          type="text"
          placeholder="What's on your mind?"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded bg-zinc-800 text-white"
        />

        <label className="block mb-2 text-sm">Images</label>
        <div
          onClick={() => document.getElementById("file-upload")?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.length) {
              handleFileSelect(e.dataTransfer.files);
            }
          }}
          className="w-full p-4 border border-dashed border-gray-400 rounded bg-zinc-800 text-center text-sm mb-4 cursor-pointer"
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
          onChange={(e) => {
            if (e.target.files) {
              handleFileSelect(e.target.files);
            }
          }}
        />

        {previewUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {previewUrls.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Preview ${idx}`}
                className="w-full h-32 object-cover rounded border border-zinc-700"
              />
            ))}
          </div>
        )}

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
