import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useParams, Link } from "react-router-dom";
import { Image, Warehouse} from "lucide-react";
import EditProfile from "../components/editProfile";
import FollowList from "../components/followList";
import FollowButton from "../components/followButton";
import PostModal from "../components/postModal";

export default function Profile() {
  const [username, setUsername] = useState("");
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [bio, setBio] = useState("");
  const [cars, setCars] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [url, setUrl] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [currentUserID, setCurrentUserID] = useState("");
  const [profileUserID, setProfileUserID] = useState("");
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [modalType, setModalType] = useState<"followers" | "following" | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPostID, setSelectedPostID] = useState<string | null>(null);
  const [filename, setFilename] = useState("")
  const [viewMode, setViewMode] = useState<"posts" | "garage">("posts");
  const { username: routeUsername } = useParams();

  useEffect(() => {
    const fetchProfileData = async () => {
      // Fetch the profile being viewed
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("userid, username, bio, url, filename")
        .eq("username", routeUsername)
        .single();

      if (userError || !userData) {
        console.error("Error fetching user profile", userError);
        return;
      }

      setUsername(userData.username);
      setFilename(userData.filename);
      setBio(userData.bio);
      setUrl(userData.url);
      const userID = userData.userid;

      // Fetch followers and following
      const { count: followersCount } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("followeeid", userID);
      setFollowers(followersCount || 0);

      const { count: followingCount } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("followerid", userID);
      setFollowing(followingCount || 0);

      // Fetch cars
      const { data: carsData } = await supabase
        .from("cars")
        .select("*")
        .eq("userid", userID);
      setCars(carsData || []);

      // Fetch posts
      const { data: postsData } = await supabase
        .from("posts")
        .select("postid, caption, images(url)")
        .eq("userid", userID);
      setPosts(postsData || []);
    };

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUsername(user.username);
      } catch (err) {
        console.error("Failed to parse stored user:", err);
      }
    }

    fetchProfileData();
  }, []);

  useEffect(() => {
  const fetchUserIDs = async () => {
    // Get ID of current logged-in user
    const { data: currentUserData } = await supabase
      .from("users")
      .select("userid")
      .eq("username", currentUsername)
      .single();

    if (currentUserData) setCurrentUserID(currentUserData.userid);

    // Get ID of profile user being viewed
    const { data: profileUserData } = await supabase
      .from("users")
      .select("userid")
      .eq("username", routeUsername)
      .single();

    if (profileUserData) setProfileUserID(profileUserData.userid);
  };

  if (currentUsername && routeUsername) fetchUserIDs();
}, [currentUsername, routeUsername]);

  return (
    <div className="text-white min-h-screen bg-black flex flex-col">
      {/* Sticky Header */}
      <div className="p-6 flex-shrink-0 sticky top-0 bg-black z-10 border-b border-gray-800">
        <div className="flex flex-row items-start gap-4 sm:gap-6">
          {/* Left: PFP + Stats stacked vertically */}
          <div className="flex flex-col items-start flex-shrink-0">
            <img
              src={url || "/images/default-pp.png"}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-red-600 mb-2"
            />
            <div className="text-gray-400 text-sm flex flex-col gap-1">
              <span
                onClick={() => { setModalType("followers"); setShowFollowModal(true); }}
                className="cursor-pointer hover:underline"
              >
                {followers} FOLLOWERS
              </span>
              <span
                onClick={() => { setModalType("following"); setShowFollowModal(true); }}
                className="cursor-pointer hover:underline"
              >
                {following} FOLLOWING
              </span>
              <span className="cursor-default">{posts.length} POSTS</span>
              <span className="cursor-default">{cars.length} CARS</span>
            </div>
          </div>

          {/* Right: Username, Bio, Buttons */}
          <div className="flex flex-col justify-start w-full">
            <h2 className="text-2xl font-bold font-[Racing Sans One] text-red-600 mb-1">
              @{username}
            </h2>
            <p className="text-gray-300 mb-2">{bio}</p>

            {currentUsername === routeUsername && (
              <button
                onClick={() => setShowEditModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-medium w-fit"
              >
                Edit Profile
              </button>
            )}
            {currentUserID !== profileUserID && (
              <div className="mt-2">
                <FollowButton
                  currentUserID={currentUserID}
                  profileUserID={profileUserID}
                />
              </div>
            )}
          </div>
        </div>


        {/* Toggle Bar */}
        <div className="mt-6 flex gap-6 text-sm font-semibold justify-center">
          <button
            onClick={() => setViewMode("posts")}
            className={`relative transition-all duration-300 ease-in-out ${viewMode === "posts" ? "text-red-500" : "text-white"}`}
          >
            <Image size={24} />
            {viewMode === "posts" && (
              <div className="absolute bottom-[-4px] left-0 right-0 h-[2px] bg-red-500 transition-all duration-300" />
            )}
          </button>
          <button
            onClick={() => setViewMode("garage")}
            className={`relative transition-all duration-300 ease-in-out ${viewMode === "garage" ? "text-red-500" : "text-white"}`}
          >
            <Warehouse size={24} />
            {viewMode === "garage" && (
              <div className="absolute bottom-[-4px] left-0 right-0 h-[2px] bg-red-500 transition-all duration-300" />
            )}
          </button>
        </div>
      </div>

      {/* Scrollable Content Section */}
      <div className="overflow-y-auto flex-1 px-6 pb-6">
        {viewMode === "posts" ? (
          <div className="grid grid-cols-3 gap-1 mt-2">
            {posts.length === 0 ? (
              <p className="text-gray-400 text-center col-span-3">{username} has no posts.</p>
            ) : (
              posts.map((post, index) => (
                <div
                  key={index}
                  className="cursor-pointer group overflow-hidden"
                  onClick={() => {
                    setSelectedPostID(post.postid);
                    setShowPostModal(true);
                  }}
                >
                  <div className="aspect-square w-full bg-gray-800 overflow-hidden">
                    <img
                      src={post.images?.[0]?.url || "/images/default-pp.jpg"}
                      alt="Post"
                      className="object-cover w-full h-full group-hover:opacity-75"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 mt-2">
            {cars.length === 0 ? (
              <p className="text-gray-400 text-center col-span-3">{username} has no cars.</p>
            ) : (
              cars.map((car, index) => (
              <Link
                key={index}
                to={`/car/${car.carid}`}
              >
                <div className="bg-black border border-gray-700 rounded text-center hover:border-red-600 transition">
                  <div className="aspect-[3/2] w-full">
                    <img
                      src={car.url || "/images/default-pp.png"}
                      alt="Car"
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <p className="text-white text-lg font-bold p-2 tracking-wide uppercase">
                    {car.make} {car.model} {car.year}
                  </p>
                </div>
              </Link>
            )))}
          </div>
        )}
      </div>

      {/* Modals */}
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

      {showEditModal && (
        <EditProfile
          currentBio={bio}
          currentPfp={url}
          currentFilename={filename}
          onClose={() => setShowEditModal(false)}
          onSave={({ bio: updatedBio, url: updatedUrl, filename: updatedFilename }) => {
            setBio(updatedBio);
            setUrl(updatedUrl);
            setFilename(updatedFilename);
          }}
        />
      )}

      {showFollowModal && modalType && (
        <FollowList
          type={modalType}
          userID={profileUserID}
          onClose={() => {
            setShowFollowModal(false);
            setModalType(null);
          }}
        />
      )}
    </div>
  );
}