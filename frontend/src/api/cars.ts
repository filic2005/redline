import { apiFetch } from './httpClient';

export interface CarRecord {
  carid: string;
  userid: string;
  make: string;
  model: string;
  year: number;
  url?: string | null;
  filename?: string | null;
  users?: { username: string };
}

export async function fetchCarsByUser(userID: string): Promise<CarRecord[]> {
  return apiFetch<CarRecord[]>(`/cars/user/${userID}`);
}

export async function fetchCarDetail(carID: string): Promise<CarRecord> {
  return apiFetch<CarRecord>(`/cars/detail/${carID}`);
}

export async function searchCars(params: { make?: string; model?: string; year?: number | string }): Promise<CarRecord[]> {
  const search = new URLSearchParams();
  if (params.make) search.set('make', params.make);
  if (params.model) search.set('model', params.model);
  if (params.year !== undefined) search.set('year', String(params.year));

  return apiFetch<CarRecord[]>(`/cars/search?${search.toString()}`);
}

export async function createCar(payload: { make: string; model: string; year: number; url?: string | null; filename?: string | null }): Promise<CarRecord> {
  return apiFetch<CarRecord>('/cars', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateCar(carID: string, payload: Partial<{ make: string; model: string; year: number; url: string | null; filename: string | null }>): Promise<CarRecord> {
  return apiFetch<CarRecord>(`/cars/${carID}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteCar(carID: string) {
  return apiFetch(`/cars/${carID}`, {
    method: 'DELETE',
  });
}
