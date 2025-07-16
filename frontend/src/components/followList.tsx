import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

interface FollowListModalProps {
  type: "followers" | "following";
  userID: string;
  onClose: () => void;
}

export default function FollowList({ type, userID, onClose }: FollowListModalProps) {
  const [users, setUsers] = useState<any[]>([]);
  const title = type === "followers" ? "Followers" : "Following";

  useEffect(() => {
    const fetchFollows = async () => {
      const followField = type === "followers" ? "followeeid" : "followerid";
      const userJoin = type === "followers" ? "followerid" : "followeeid";

      const { data, error } = await supabase
        .from("follows")
        .select(`${userJoin}, users: ${userJoin} (username, url)`)
        .eq(followField, userID);

      if (error) {
        console.error("Error fetching follows:", error);
      } else {
        setUsers(data.map((item) => item.users));
      }
    };

    fetchFollows();
  }, [type, userID]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-zinc-900 text-black dark:text-white rounded-xl p-6 w-80 max-h-[80vh] overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-red-500 font-bold text-lg">×</button>
        </div>
        {users.length === 0 ? (
          <p className="text-sm text-gray-400">No {title.toLowerCase()} yet.</p>
        ) : (
          <ul className="space-y-3">
            {users.map((user, i) => (
              <li key={i} className="flex items-center gap-3">
                <img
                  src={user.url || "/images/default-pp.png"}
                  alt={user.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <a href={`/profile/${user.username}`} className="hover:underline">
                  @{user.username}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}