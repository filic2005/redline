import { supabase } from '../utils/supabaseClient.ts';

export class CarRepo {
  static async createCar(userID: string, make: string, model: string, year: number, url?: string | null, filename?: string | null) {
    const { data, error } = await supabase
      .from('cars')
      .insert([{ userid: userID, make, model, year, url, filename }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async getCarsByUserID(userID: string) {
    const { data, error } = await supabase
      .from('cars')
      .select('carid, userid, make, model, year, url, filename')
      .eq('userid', userID)
      .order('year', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  }

  static async getCarById(carID: string) {
    const { data, error } = await supabase
      .from('cars')
      .select('carid, userid, make, model, year, url, filename, users:userid(username)')
      .eq('carid', carID)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async searchCars(params: { make?: string; model?: string; year?: number }) {
    let query = supabase
      .from('cars')
      .select('carid, userid, make, model, year, url, filename, users:userid(username)');

    if (params.make) {
      query = query.ilike('make', `%${params.make}%`);
    }

    if (params.model) {
      query = query.ilike('model', `%${params.model}%`);
    }

    if (params.year !== undefined) {
      query = query.eq('year', params.year);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  static async updateCar(carID: string, userID: string, payload: Partial<{ make: string; model: string; year: number; url: string | null; filename: string | null }>) {
    const { data, error } = await supabase
      .from('cars')
      .update(payload)
      .match({ carid: carID, userid: userID })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async deleteCar(carID: string, userID: string) {
    const { data, error } = await supabase
      .from('cars')
      .delete()
      .match({ carid: carID, userid: userID })
      .select('carid, filename')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
