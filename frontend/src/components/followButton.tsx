import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

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
      const { data, error } = await supabase
        .from("follows")
        .select("followerid")
        .eq("followerid", currentUserID)
        .eq("followeeid", profileUserID)
        .single();

      setIsFollowing(!!data && !error);
      setLoading(false);
    };

    if (shouldShow) checkFollowStatus();
  }, [currentUserID, profileUserID]);

  const handleToggleFollow = async () => {
    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("followerid", currentUserID)
        .eq("followeeid", profileUserID);
      setIsFollowing(false);
    } else {
      await supabase
        .from("follows")
        .insert([{ followerid: currentUserID, followeeid: profileUserID }]);
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