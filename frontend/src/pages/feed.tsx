import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import PostModal from "../components/postModal";

interface Post {
  postid: string;
  caption: string;
  userid: string;
  createdat: string;
  images: { url: string }[];
  users: { 
    username: string;
    url: string;
  };
  likeCount: number;
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPostID, setSelectedPostID] = useState<string | null>(null);
  const [currentUserID, setCurrentUserID] = useState("");
  const [feedType, setFeedType] = useState<"all" | "following">("all");


  useEffect(() => {
    const fetchPosts = async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData?.session?.user) return;

      const userJSON = localStorage.getItem("user");
      if (!userJSON) return;
      const user = JSON.parse(userJSON);
      const currentUserID = user.userid;

      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      // Get user's followed accounts
      const { data: followsData } = await supabase
        .from("follows")
        .select("followeeid")
        .eq("followerid", currentUserID);

      const followingUserIDs = followsData?.map(f => f.followeeid) || [];

      // Get current user's cars
      const { data: carData } = await supabase
        .from("cars")
        .select("make, model")
        .eq("userid", currentUserID);

      const makes = carData?.map(c => c.make) || [];
      const models = carData?.map(c => c.model) || [];

      // Get userIDs of people with similar cars
      const { data: similarCarUsers, error: userFetchError } = await supabase
        .from("cars")
        .select("userid")
        .in("make", makes)
        .in("model", models)
        .neq("userid", currentUserID);

      if (userFetchError) {
        console.error("Error fetching similar car users:", userFetchError);
      }

      const similarUserIDs = [...new Set(similarCarUsers?.map((c) => c.userid))]; // dedupe

      // Fetch posts from followed users
      const { data: followerPosts } = await supabase
        .from("posts")
        .select("postid, caption, userid, createdat, images(url), users!posts_userid_fkey(username, url)")
        .in("userid", followingUserIDs)
        .gte("createdat", twoWeeksAgo.toISOString());

      // Fetch posts from users with similar cars
      let similarPosts: Post[] = [];
      if (feedType === "all" && similarUserIDs.length > 0) {
        const { data: fetchedPosts } = await supabase
          .from("posts")
          .select("postid, caption, userid, createdat, images(url), users!posts_userid_fkey(username, url)")
          .in("userid", similarUserIDs)
          .gte("createdat", twoWeeksAgo.toISOString());

        similarPosts = (fetchedPosts || []).map((post: any) => ({
          ...post,
          users: Array.isArray(post.users) ? post.users[0] : post.users || { username: "unknown", url: "" },
          likeCount: 0,
        }));
      }

      // Combine and deduplicate posts
      const allPostsRaw = [...(followerPosts || []), ...similarPosts];
      const uniqueMap = new Map<string, Post>();
      allPostsRaw.forEach((post: any) => {
        if (!uniqueMap.has(post.postid)) {
          uniqueMap.set(post.postid, {
            ...post,
            users: Array.isArray(post.users) ? post.users[0] : post.users || { username: "unknown", url: "" },
            likeCount: 0, // filled next
          });
        }
      });

      const uniquePosts = Array.from(uniqueMap.values());

      // Fetch like counts
      const postIDs = uniquePosts.map(p => p.postid);
      const { data: likesData } = await supabase
        .from("likes")
        .select("postid")
        .in("postid", postIDs);

      const likeMap = new Map<string, number>();
      likesData?.forEach((like) => {
        likeMap.set(like.postid, (likeMap.get(like.postid) || 0) + 1);
      });

      const finalPosts = uniquePosts.map((post) => ({
        ...post,
        likeCount: likeMap.get(post.postid) || 0,
      })).sort((a, b) => new Date(b.createdat).getTime() - new Date(a.createdat).getTime());

      setPosts(finalPosts);
    };


    fetchPosts();
  }, [feedType]);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setCurrentUserID(data.session?.user.id || "");
    };
    fetchSession();
  }, []);

  return (
    <div className="p-6 text-white">
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setFeedType("all")}
          className={`text-sm px-3 py-1 rounded ${feedType === "all" ? "bg-red-600 text-white" : "bg-gray-800 text-gray-300"}`}
        >
          All
        </button>
        <button
          onClick={() => setFeedType("following")}
          className={`text-sm px-3 py-1 rounded ${feedType === "following" ? "bg-red-600 text-white" : "bg-gray-800 text-gray-300"}`}
        >
          Following
        </button>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-400">No posts from users you follow in the last 2 weeks.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {posts.map((post, index) => (
            <div
              key={index}
              className="bg-gray-900 rounded-lg shadow-lg overflow-hidden mx-auto w-full max-w-md"
            >
              {/* Top: profile */}
              <div className="flex items-center gap-3 p-4">
                <img
                  src={post.users.url || "/images/default-pp.png"}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <p className="text-white font-semibold text-sm">@{post.users.username}</p>
              </div>

              {/* Image */}
              <div
                className="w-full h-[500px] bg-black cursor-pointer"
                onClick={() => {
                  setSelectedPostID(post.postid);
                  setShowPostModal(true);
                }}
              >
                {post.images?.[0]?.url && (
                  <img
                    src={post.images[0].url}
                    alt="Post"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Caption + likes */}
              <div className="p-4">
                <p className="text-white text-sm mb-1">{post.likeCount} likes</p>
                <p className="text-gray-300 text-sm">{post.caption}</p>
              </div>
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
    </div>
  );
}
