import { likePost, unlikePost } from "../api/likes";

export const toggleLike = async (postID: string, currentlyLiked: boolean): Promise<boolean> => {
  try {
    if (currentlyLiked) {
      await unlikePost(postID);
      return false;
    }

    await likePost(postID);
    return true;
  } catch (err) {
    console.error('Failed to toggle like', err);
    return currentlyLiked;
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
