import { apiFetch } from './httpClient';

export interface ModRecord {
  modid: string;
  suid: string;
  carid: string;
  name: string;
  type: string;
  mileage: number;
  description: string;
}

export async function fetchModsByCar(carID: string): Promise<ModRecord[]> {
  return apiFetch<ModRecord[]>(`/mods/${carID}`);
}

export async function deleteMod(modID: string) {
  return apiFetch(`/mods/${modID}`, {
    method: 'DELETE',
  });
}
