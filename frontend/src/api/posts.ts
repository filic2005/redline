import { apiFetch } from './httpClient';

export interface FeedPost {
  postid: string;
  caption: string;
  userid: string;
  createdat: string;
  images: { url: string }[];
  user: { username: string; url: string | null };
  likeCount: number;
  commentCount: number;
  hasLiked: boolean;
}

export interface PostRecord {
  postid: string;
  caption: string;
  userid: string;
  createdat?: string;
  images?: { url: string }[];
  users?: any;
  likeCount?: number;
  commentCount?: number;
  hasLiked?: boolean;
}

export async function fetchFeed(params: {
  type: 'all' | 'following';
  cursorCreatedAt?: string | null;
  cursorPostId?: string | null;
  limit?: number;
}): Promise<FeedPost[]> {
  const search = new URLSearchParams();
  search.set('type', params.type);
  if (params.cursorCreatedAt && params.cursorPostId) {
    search.set('cursorCreatedAt', params.cursorCreatedAt);
    search.set('cursorPostId', params.cursorPostId);
  }
  if (params.limit) {
    search.set('limit', String(params.limit));
  }

  return apiFetch<FeedPost[]>(`/posts/feed?${search.toString()}`);
}

export async function fetchPostsByUser(userID: string): Promise<PostRecord[]> {
  return apiFetch<PostRecord[]>(`/posts/user/${userID}`);
}

export async function fetchPost(postID: string): Promise<PostRecord> {
  return apiFetch<PostRecord>(`/posts/${postID}`);
}

export async function createPost(payload: { caption: string }): Promise<PostRecord> {
  return apiFetch<PostRecord>('/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deletePost(postID: string) {
  return apiFetch(`/posts/${postID}`, {
    method: 'DELETE',
  });
}
