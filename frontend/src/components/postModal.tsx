import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

interface Props {
  postID: string;
  currentUserID: string;
  onClose: () => void;
}

export default function PostModal({ postID, currentUserID, onClose }: Props) {
  const [images, setImages] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [postUser, setPostUser] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("userid, caption, images(url)")
        .eq("postid", postID)
        .single();

      if (error || !data) {
        console.error("Failed to fetch post", error);
        return;
      }

      setCaption(data.caption);
      setImages(data.images.map((img: any) => img.url));
      setPostUser(data.userid);
    };

    const fetchLikes = async () => {
      const { data: likeData, error } = await supabase
        .from("likes")
        .select("userid")
        .eq("postid", postID);

      if (error) {
        console.error("Failed to fetch likes", error);
        return;
      }

      setLikes(likeData.length);
      setHasLiked(likeData.some((like) => like.userid === currentUserID));
    };

    const fetchComments = async () => {
        const { data, error } = await supabase
            .from("comments")
            .select("commentid, text, createdat, userid, users(username)")
            .eq("postid", postID)
            .order("createdat", { ascending: false });

        if (error) {
            console.error("Failed to fetch comments", error);
            return;
        }

        setComments(data || []);
    };


    fetchPost();
    fetchLikes();
    fetchComments();
  }, [postID, currentUserID]);

  

  const toggleLike = async () => {
    if (hasLiked) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("postid", postID)
        .eq("userid", currentUserID);

      if (!error) {
        setLikes((l) => l - 1);
        setHasLiked(false);
      }
    } else {
      const { error } = await supabase
        .from("likes")
        .insert([{ postid: postID, userid: currentUserID }]);

      if (!error) {
        setLikes((l) => l + 1);
        setHasLiked(true);
      }
    }
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;

    const { error } = await supabase
      .from("comments")
      .insert([{ postid: postID, userid: currentUserID, text: newComment }]);

    if (!error) {
      const { data: userData } = await supabase
        .from("users")
        .select("username")
        .eq("userid", currentUserID)
        .single();

      setComments((prev) => [
        { text: newComment, createdat: new Date(), users: userData },
        ...prev,
      ]);

      setNewComment("");
    }
  };

    const handleDeleteComment = async (commentID: string) => {
        const { error } = await supabase
            .from("comments")
            .delete()
            .eq("commentid", commentID);

        if (!error) {
            setComments((prev) => prev.filter((c) => c.commentid !== commentID));
        } else {
            console.error("Failed to delete comment", error);
        }
    };

    const handleDeletePost = async (postID: string) => {
      const confirmDelete = window.confirm("Are you sure you want to delete this post?");

      if (!confirmDelete) return;
        //Fetch image URLs
        const { data: imageData, error: fetchError } = await supabase
            .from("images")
            .select("url")
            .eq("postid", postID);

        if (fetchError) {
            console.error("Failed to fetch post images", fetchError);
            return;
        }

        // Extract file paths relative to the bucket
        const imagePaths = (imageData || []).map((img) => {
            const publicPrefix = "https://jlfrfodecmyuhurplzek.supabase.co/storage/v1/object/public/post-images/";
            return img.url.replace(publicPrefix, "");
        });

        //Delete images from Storage
        if (imagePaths.length > 0) {
            const { error: storageError } = await supabase.storage
            .from("post-images")
            .remove(imagePaths);

            if (storageError) {
            console.error("Failed to delete images from storage", storageError);
            return;
            }
        }

        //Delete the post from DB (cascade deletes comments, likes, images in DB)
        const { error: deleteError } = await supabase
            .from("posts")
            .delete()
            .eq("postid", postID);

        if (deleteError) {
            console.error("Failed to delete post", deleteError);
        } else {
            onClose();
        }
    };

    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center px-2 sm:px-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl w-full max-w-5xl h-[90vh] flex flex-col sm:flex-row shadow-lg overflow-hidden">
          
          {/* Left: Image Carousel */}
          <div className="w-full sm:w-1/2 bg-black relative flex items-center justify-center h-64 sm:h-auto">
            {images.length > 0 && (
              <>
                <img
                  src={images[activeIndex]}
                  alt={`Image ${activeIndex + 1}`}
                  className="max-h-full max-w-full object-contain"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveIndex((prev) => (prev - 1 + images.length) % images.length)
                      }
                      className="absolute left-4 text-white text-3xl"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() =>
                        setActiveIndex((prev) => (prev + 1) % images.length)
                      }
                      className="absolute right-4 text-white text-3xl"
                    >
                      ›
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Right: Info */}
          <div className="w-full sm:w-1/2 p-4 flex flex-col justify-between max-h-full overflow-y-auto">
            {/* Top: Close + Caption */}
            <div className="flex justify-between items-start mb-2 gap-2">
              <div className="max-h-32 overflow-y-auto text-zinc-800 dark:text-white font-medium pr-2 break-words whitespace-pre-wrap">
                {caption}
              </div>
              <div className="flex flex-col items-end gap-1">
                {postUser === currentUserID && (
                  <button
                    onClick={() => handleDeletePost(postID)}
                    className="text-red-500 text-xs hover:underline"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-2xl font-bold text-zinc-500 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Middle: Comments */}
            <div className="flex-1 overflow-y-auto space-y-3 mt-2 pr-1">
              {comments.map((c, i) => (
                <div key={i} className="text-sm text-zinc-700 dark:text-zinc-200 flex justify-between items-center">
                  <div>
                    <span className="font-semibold">@{c.users?.username}:</span> {c.text}
                  </div>
                  {c.userid === currentUserID && (
                    <button
                      onClick={() => handleDeleteComment(c.commentid)}
                      className="text-red-500 text-xs ml-2 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom: Like + Add Comment */}
            <div className="mt-4 border-t border-zinc-300 dark:border-zinc-700 pt-3">
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={toggleLike}
                  className={`text-lg ${hasLiked ? "text-red-600" : "text-zinc-600"}`}
                >
                  ❤️
                </button>
                <span className="text-sm text-zinc-500">
                  {likes} {likes === 1 ? "like" : "likes"}
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-600 text-sm text-black dark:text-white bg-white dark:bg-zinc-800"
                />
                <button
                  onClick={submitComment}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 text-sm rounded"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    );


}
