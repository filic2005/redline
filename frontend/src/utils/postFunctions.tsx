import { supabase } from "./supabaseClient";

export const toggleLike = async (postID: string, userID: string): Promise<boolean> => {
  const { data: existing, error: fetchError } = await supabase
    .from("likes")
    .select("postid")
    .eq("postid", postID)
    .eq("userid", userID);

  if (fetchError) {
    console.error("Error checking existing like", fetchError);
    return false;
  }

  if (existing?.length) {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("postid", postID)
      .eq("userid", userID);

    if (error) {
      console.error("Failed to unlike", error);
      return false;
    }

    return false; // unliked
  } else {
    const { error } = await supabase
      .from("likes")
      .insert([{ postid: postID, userid: userID }]);

    if (error) {
      console.error("Failed to like", error);
      return false;
    }

    return true;
  }
};

type DoubleTapCallback = (id: string) => void;

export const createDoubleTapHandler = (): ((id: string, callback: DoubleTapCallback) => void) => {
  const lastTapMap: { [key: string]: number } = {};

  return (id: string, callback: DoubleTapCallback) => {
    const now = Date.now();
    const lastTap = lastTapMap[id] || 0;

    if (now - lastTap < 300) {
      callback(id);
    }

    lastTapMap[id] = now;
  };
};

