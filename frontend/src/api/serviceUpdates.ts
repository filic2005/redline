import { apiFetch } from './httpClient';

export interface ServiceUpdateRecord {
  suid: string;
  carid: string;
  createdat: string;
  description: string;
}

export async function fetchServiceUpdates(carID: string): Promise<ServiceUpdateRecord[]> {
  return apiFetch<ServiceUpdateRecord[]>(`/updates/${carID}`);
}

export async function createServiceUpdate(payload: { carID: string; description: string; mods: Array<{ name: string; type: string; mileage: number; description: string }> }) {
  return apiFetch(`/updates`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteServiceUpdate(updateID: string) {
  return apiFetch(`/updates/${updateID}`, {
    method: 'DELETE',
  });
}
