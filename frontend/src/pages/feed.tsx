import { useEffect, useRef, useState, useCallback } from "react";
import PostModal from "../components/postModal";
import { MessageCircle } from "lucide-react";
import { toggleLike, createDoubleTapHandler } from "../utils/postFunctions";
import AnimatedCarOverlay from "../components/animatedCarLike";
import SwipeableImageGallery from "../components/swipeableImageGallery";
import { fetchFeed } from "../api/posts";
import type { FeedPost } from "../api/posts";
import { supabase } from "../utils/supabaseClient";

type Post = FeedPost & {
  user: {
    username: string;
    url: string | null;
  };
};

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPostID, setSelectedPostID] = useState<string | null>(null);
  const [currentUserID, setCurrentUserID] = useState("");
  const [feedType, setFeedType] = useState<"all" | "following">("all");
  const [animating, setAnimating] = useState(false);
  const [likedCar, setLikedCar] = useState(true);
  const [tapPosition, setTapPosition] = useState<{ x: number; y: number } | null>(null);
  const [lastCursor, setLastCursor] = useState<{ createdat: string; postid: string } | null>(null);
  const [feedReady, setFeedReady] = useState(false);

  const handleDoubleTap = useRef(createDoubleTapHandler()).current;

  const fetchMorePosts = useCallback(async () => {
    if (loadingMore || !currentUserID || !hasMore) return;

    setLoadingMore(true);

    try {
      const data = await fetchFeed({
        type: feedType,
        cursorCreatedAt: lastCursor?.createdat,
        cursorPostId: lastCursor?.postid,
        limit: 5,
      });

      if (!data.length) {
        setHasMore(false);
      } else {
        const seenIDs = new Set(posts.map((p) => p.postid));
        const uniqueNewPosts = data.filter((post) => !seenIDs.has(post.postid));
        setPosts((prev) => [...prev, ...uniqueNewPosts]);

        const last = data[data.length - 1];
        setLastCursor({ createdat: last.createdat, postid: last.postid });
      }
    } catch (err) {
      console.error('Failed to fetch feed', err);
      setHasMore(false);
    }

    setLoadingMore(false);
  }, [currentUserID, feedType, hasMore, loadingMore, lastCursor, posts]);

  useEffect(() => {
    const init = async () => {
      setFeedReady(false);
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData?.session?.user) return;

      const userJSON = localStorage.getItem("user");
      if (!userJSON) return;
      const user = JSON.parse(userJSON);
      setCurrentUserID(user.userid);

      setPosts([]);
      setLastCursor(null);
      setHasMore(true);

      setFeedReady(true);
    };

    init();
  }, [feedType]);

  useEffect(() => {
    if (feedReady) fetchMorePosts();
  }, [feedReady, fetchMorePosts]);

  useEffect(() => {
    if (!observerRef.current || !hasMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchMorePosts();
      }
    }, { threshold: 1.0 });

    observer.observe(observerRef.current);

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [fetchMorePosts, hasMore]);

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 pb-16">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setFeedType("all")}
            className={`cursor-pointer text-sm px-4 py-2 rounded-full font-medium transition ${feedType === "all" ? "bg-red-600 text-white" : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"}`}
          >
            All
          </button>
          <button
            onClick={() => setFeedType("following")}
            className={`cursor-pointer text-sm px-4 py-2 rounded-full font-medium transition ${feedType === "following" ? "bg-red-600 text-white" : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"}`}
          >
            Following
          </button>
        </div>

        {posts.length === 0 ? (
          <p className="text-center text-gray-400">
            No posts from users you follow in the last 2 weeks.
          </p>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <div key={post.postid} className="pb-8 border-b border-zinc-800 last:border-none">
                <div className="flex items-center gap-3 px-2 sm:px-0 cursor-pointer">
                  <img
                    src={post.user?.url || "/images/default-pp.png"}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                  />
                  <p onClick={() => window.location.href = `/profile/${post.user?.username}`} className="text-sm font-semibold text-white cursor-pointer">
                    @{post.user?.username}
                  </p>
                </div>

                <div
                  className="relative w-full aspect-square bg-black mt-2 cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    setTapPosition({ x, y });

                    handleDoubleTap(post.postid, async (id) => {
                      const liked = await toggleLike(id, !!post.hasLiked);
                      setPosts((prev) =>
                        prev.map((p) => {
                          if (p.postid !== id) return p;
                          const delta = (liked ? 1 : 0) - (p.hasLiked ? 1 : 0);
                          return { ...p, hasLiked: liked, likeCount: p.likeCount + delta };
                        })
                      );
                      setLikedCar(liked);
                      setAnimating(true);
                      setTimeout(() => setAnimating(false), 700);
                    });
                  }}
                >
                  <SwipeableImageGallery images={post.images.map((img) => img.url)} />
                  <AnimatedCarOverlay show={animating} liked={likedCar} position={tapPosition} />
                </div>

                <div className="px-2 sm:px-0 pt-2 flex justify-between items-center">
                  <p className="text-sm font-medium text-white">
                    {post.likeCount} {post.likeCount === 1 ? "like" : "likes"} &middot; {post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}
                  </p>
                  <button
                    className="text-zinc-500 cursor-pointer hover:text-red-500"
                    onClick={() => {
                      setSelectedPostID(post.postid);
                      setShowPostModal(true);
                    }}
                  >
                    <MessageCircle size={18} />
                  </button>
                </div>
                <p className="px-2 sm:px-0 text-sm text-gray-300">{post.caption}</p>
              </div>
            ))}
          </div>
        )}

        {showPostModal && selectedPostID && currentUserID && (
          <PostModal
            postID={selectedPostID}
            currentUserID={currentUserID}
            onClose={() => {
              setShowPostModal(false);
              setSelectedPostID(null);
            }}
          />
        )}

        <div ref={observerRef} className="h-10 w-full" />
        {loadingMore && (
          <p className="text-center text-sm text-gray-400 mt-4">Loading more...</p>
        )}
      </div>
    </div>
  );
}
