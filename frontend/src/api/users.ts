import { apiFetch } from './httpClient';

export interface UserProfile {
  userid: string;
  username: string;
  bio: string;
  email?: string;
  url?: string | null;
  filename?: string | null;
}

export async function fetchUserByUsername(username: string) {
  return apiFetch<UserProfile>(`/users/username/${username}`, { skipAuth: true });
}

export async function fetchUserById(userID: string) {
  return apiFetch<UserProfile>(`/users/id/${userID}`);
}

export async function ensureUserProfile(payload: { username: string; email: string; bio?: string }) {
  return apiFetch<UserProfile>(`/users/ensure`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateBio(newBio: string) {
  return apiFetch(`/users/bio`, {
    method: 'PATCH',
    body: JSON.stringify({ newBio }),
  });
}

export async function updateProfile(payload: { bio?: string; url?: string | null; filename?: string | null }) {
  return apiFetch(`/users/profile`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function updateUsername(newUsername: string) {
  return apiFetch(`/users/username`, {
    method: 'PATCH',
    body: JSON.stringify({ newUsername }),
  });
}

export async function deleteUser() {
  return apiFetch(`/users`, {
    method: 'DELETE',
  });
}
