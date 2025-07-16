import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useParams, Link } from "react-router-dom";
import EditProfile from "../components/editProfile";
import FollowButton from "../components/followButton";
import FollowList from "../components/followList";
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
  <div className="p-6 text-white">
    {/* Profile Header */}
    <div className="flex items-center gap-6 mb-6">
      <img
        src={url || "/images/default-pp.png"}
        alt="Profile"
        className="w-24 h-24 rounded-full object-cover"
      />
      <div>
        <h2 className="text-2xl font-bold">@{username}</h2>
        <div className="text-sm text-gray-400 flex gap-4">
          <span onClick={() => { setModalType("followers"); setShowFollowModal(true); }} className="cursor-pointer hover:underline">
            {followers} Followers
          </span>
          <span onClick={() => { setModalType("following"); setShowFollowModal(true); }} className="cursor-pointer hover:underline">
            {following} Following
          </span>
          <span>
            {currentUsername === routeUsername && (
              <button onClick={() => setShowEditModal(true)} className="ml-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
                Edit Profile
              </button>
            )}
          </span>
          <span>
            {currentUserID !== profileUserID && (
              <FollowButton
                currentUserID={currentUserID}
                profileUserID={profileUserID}
              />
            )}
          </span>
        </div>
        <p className="text-gray-300 mt-2">{bio}</p>
      </div>
    </div>


    {/* Driveway/Garage Section */}
    <div
      className="bg-gray-900 p-4 rounded-lg hover:bg-gray-800 transition cursor-pointer mb-8 max-w-[800px] mx-auto"
      onClick={() => window.location.href = `/garage/${username}`}
    >
      <div className="flex justify-center gap-4">
        {cars.slice(0, 2).map((car, index) => (
          <Link
            key={index}
            to={`/car/${car.carid}`}
            onClick={(e) => e.stopPropagation()}
            className="w-auto"
          >
            <div className="bg-gray-800 rounded text-center hover:bg-gray-700 transition overflow-hidden max-w-[200px]">
              <div className="aspect-[4/3] w-full">
                <img
                  src={car.url || "/images/default-pp.png"}
                  alt="Car"
                  className="object-cover w-full h-full"
                />
              </div>
              <p className="text-white text-xs font-medium p-2 leading-tight">
                {car.year} {car.make} {car.model}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <p className="text-center mt-4 text-sm text-gray-400">
        Press to view full garage
      </p>
    </div>



    {/* Posts Grid */}
    <div className="grid grid-cols-3 gap-1">
      {posts.length === 0 ? (
        <p className="text-gray-400">{username} has no posts.</p>
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
          currentFilename={filename} // <-- add this line
          onClose={() => setShowEditModal(false)}
          onSave={({ bio: updatedBio, url: updatedUrl, filename: updatedFilename }) => {
            setBio(updatedBio);
            setUrl(updatedUrl);
            setFilename(updatedFilename); // <-- add this too if needed
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