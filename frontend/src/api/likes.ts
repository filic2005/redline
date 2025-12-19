import { apiFetch } from './httpClient';

export async function likePost(postID: string) {
  return apiFetch<{ liked: boolean }>(`/likes/${postID}`, {
    method: 'POST',
  });
}

export async function unlikePost(postID: string) {
  return apiFetch<{ unliked: boolean }>(`/likes/${postID}`, {
    method: 'DELETE',
  });
}

export async function getLikeCount(postID: string) {
  const res = await apiFetch<{ count: number }>(`/likes/count/${postID}`);
  return res.count;
}

export async function getLikeStatus(postID: string) {
  const res = await apiFetch<{ hasLiked: boolean }>(`/likes/status/${postID}`);
  return res.hasLiked;
}
