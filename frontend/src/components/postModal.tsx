import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"
import { supabase } from "../utils/supabaseClient";
import { toggleLike, createDoubleTapHandler } from "../utils/postFunctions";
import { Heart } from "lucide-react";
import SwipeableImageGallery from "../components/swipeableImageGallery";
import AnimatedCarLike from "../components/animatedCarLike"

interface Props {
  postID: string;
  currentUserID: string;
  onClose: () => void;
}

export default function PostModal({ postID, currentUserID, onClose }: Props) {
  const [images, setImages] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [postUser, setPostUser] = useState("");
  const [postUserUsername, setPostUserUsername] = useState("");
  const [postUserURL, setPostUserURL] = useState("");
  const [animating, setAnimating] = useState(false);
  const [likedCar, setLikedCar] = useState(true);
  const [tapPosition, setTapPosition] = useState<{ x: number; y: number } | null>(null);
  const navigate = useNavigate();
  const handleDoubleTap = useRef(createDoubleTapHandler()).current;
  const location = useLocation();

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("userid, caption, images(url), users:posts_userid_fkey(username, url)")
        .eq("postid", postID)
        .single();

      if (error || !data) {
        console.error("Failed to fetch post", error);
        return;
      }

      setCaption(data.caption);
      setImages(data.images.map((img: any) => img.url));
      setPostUser(data.userid);
      setPostUserUsername(data.users?.username || "");
      setPostUserURL(data.users?.url || "");
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
        .select("commentid, text, createdat, userid, users(username, url)")
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

  const handleLike = async () => {
    const liked = await toggleLike(postID, currentUserID);
    setLikes((prev) => prev + (liked ? 1 : -1));
    setHasLiked(liked);
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

    const { data: imageData, error: fetchError } = await supabase
      .from("images")
      .select("url")
      .eq("postid", postID);

    if (fetchError) {
      console.error("Failed to fetch post images", fetchError);
      return;
    }

    const imagePaths = (imageData || []).map((img) => {
      const publicPrefix = "https://jlfrfodecmyuhurplzek.supabase.co/storage/v1/object/public/post-images/";
      return img.url.replace(publicPrefix, "");
    });

    if (imagePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("post-images")
        .remove(imagePaths);

      if (storageError) {
        console.error("Failed to delete images from storage", storageError);
        return;
      }
    }

    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("postid", postID);

    if (deleteError) {
      console.error("Failed to delete post", deleteError);
    } else {
      onClose();
      window.location.reload();
    }
  };
  return (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center px-2 sm:px-4">
    <div className="bg-zinc-900 rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col sm:flex-row shadow-2xl overflow-hidden">
      {/* Image */}
      <div
        className="w-full sm:w-1/2 bg-black relative flex items-center justify-center sm:max-h-[90vh]"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          setTapPosition({ x, y });

          handleDoubleTap(postID, async (id) => {
            const liked = await toggleLike(id, currentUserID);
            setLikes((prev) => prev + (liked ? 1 : -1));
            setHasLiked(liked);
            setLikedCar(liked);
            setAnimating(true);
            setTimeout(() => setAnimating(false), 700);
          });
        }}
      >
        {images.length > 0 && (
          <SwipeableImageGallery images={images} />
        )}
        <AnimatedCarLike show={animating} liked={likedCar} position={tapPosition} />
      </div>

      {/* Right Side: Content */}
      <div className="w-full sm:w-1/2 flex flex-col bg-black text-white overflow-y-auto max-h-[90vh] min-h-0">
        {/* Header + Caption */}
        <div className="flex flex-col gap-2 p-4 border-b border-zinc-800">
          <div className="flex justify-between items-center flex-wrap gap-y-2">
            <div className="flex items-center gap-2">
              <img
                src={postUserURL || "/images/default-pp.png"}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border border-zinc-700"
              />
              <button
                onClick={() => navigate(`/profile/${postUserUsername}`)}
                className="text-sm font-semibold text-red-500 hover:underline"
              >
                @{postUserUsername}
              </button>
            </div>
            <div className="flex items-center gap-3">
              {postUser === currentUserID && (
                <button
                  onClick={() => handleDeletePost(postID)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Delete
                </button>
              )}
              <button
                onClick={onClose}
                className="text-xl font-bold text-zinc-400 hover:text-red-500"
              >
                ×
              </button>
            </div>
          </div>
          <div className="text-sm whitespace-pre-wrap break-words">
            {caption}
          </div>
        </div>


        {/* Comments */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3">
          {comments.map((c, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <img
                src={c.users?.url || "/images/default-pp.png"}
                alt="Profile"
                className="w-6 h-6 rounded-full object-cover border border-zinc-700 mt-0.5"
              />
              <div className="flex-1">
                <button
                  onClick={() => navigate(`/profile/${c.users?.username}`)}
                  className="font-semibold text-red-500 hover:underline mr-1"
                >
                  @{c.users?.username}
                </button>
                {c.text}
              </div>
              {c.userid === currentUserID && (
                <button
                  onClick={() => handleDeleteComment(c.commentid)}
                  className="text-red-500 text-xs hover:underline ml-2"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Likes + Comment Box */}
        <div className="border-t border-zinc-800 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              className="transition-transform hover:scale-110"
              aria-label="Like"
            >
              <Heart
                size={24}
                className={`transition-all ${
                  hasLiked
                    ? "fill-red-600 stroke-red-600"
                    : "stroke-zinc-400 hover:stroke-red-500"
                }`}
              />
            </button>
            <span className="text-sm text-zinc-400">
              {likes} {likes === 1 ? "like" : "likes"}
            </span>
          </div>

          <div className="flex gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 rounded bg-zinc-800 text-white text-sm border border-zinc-700"
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