import { apiFetch } from './httpClient';

export interface CommentPayload {
  commentid: string;
  text: string;
  createdat: string;
  userid: string;
  users?: { username: string; url: string | null };
}

export async function fetchComments(postID: string) {
  return apiFetch<CommentPayload[]>(`/comments/${postID}`);
}

export async function addComment(postID: string, text: string) {
  return apiFetch(`/comments/${postID}`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export async function deleteComment(commentID: string) {
  return apiFetch(`/comments/${commentID}`, {
    method: 'DELETE',
  });
}
