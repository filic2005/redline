import { useEffect, useState } from "react";
import { fetchFollowers, followUser, unfollowUser } from "../api/follows";

interface Props {
  currentUserID: string;
  profileUserID: string;
}

export default function FollowButton({ currentUserID, profileUserID }: Props) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Only show button when viewing someone else
  const shouldShow = currentUserID && profileUserID && currentUserID !== profileUserID;

  useEffect(() => {
    const checkFollowStatus = async () => {
      setLoading(true);
      try {
        const followers = await fetchFollowers(profileUserID);
        setIsFollowing(followers.some((user) => user.userid === currentUserID));
      } catch (err) {
        console.error('Failed to check follow status', err);
        setIsFollowing(false);
      } finally {
        setLoading(false);
      }
    };

    if (shouldShow) checkFollowStatus();
  }, [currentUserID, profileUserID, shouldShow]);

  const handleToggleFollow = async () => {
    if (isFollowing) {
      await unfollowUser(profileUserID);
      setIsFollowing(false);
    } else {
      await followUser(profileUserID);
      setIsFollowing(true);
    }
  };

  if (!shouldShow) return null;

  return (
    <button
      onClick={handleToggleFollow}
      className={`px-4 py-2 rounded ${
        isFollowing ? "bg-gray-300 hover:bg-gray-400" : "bg-red-600 hover:bg-red-700 text-white"
      }`}
      disabled={loading}
    >
      {loading ? "..." : isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
}
