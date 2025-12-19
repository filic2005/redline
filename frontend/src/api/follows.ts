import { apiFetch } from './httpClient';

export interface FollowUser {
  userid: string;
  username: string;
  url: string | null;
}

export async function followUser(userID: string) {
  return apiFetch(`/follows/${userID}`, { method: 'POST' });
}

export async function unfollowUser(userID: string) {
  return apiFetch(`/follows/${userID}`, { method: 'DELETE' });
}

export async function fetchFollowers(userID: string) {
  return apiFetch<FollowUser[]>(`/follows/followers/${userID}`);
}

export async function fetchFollowing(userID: string) {
  return apiFetch<FollowUser[]>(`/follows/following/${userID}`);
}
