import { apiFetch } from './httpClient';

export interface ImageRecord {
  imageid?: string;
  carid?: string | null;
  postid?: string | null;
  url: string;
}

export async function addImage(payload: { carID?: string | null; postID?: string | null; url: string }) {
  return apiFetch(`/images`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchImagesByPost(postID: string): Promise<ImageRecord[]> {
  return apiFetch<ImageRecord[]>(`/images/post/${postID}`);
}

export async function deleteImage(imageID: string) {
  return apiFetch(`/images/${imageID}`, {
    method: 'DELETE',
  });
}
