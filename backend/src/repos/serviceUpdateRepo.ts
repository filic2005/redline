import { supabase } from '../utils/supabaseClient.ts';

export class ServiceUpdateRepo {
  static async createServiceUpdate(carID: string, description: string) {
    const { data, error } = await supabase
      .from('serviceupdates')
      .insert([{ carid: carID, description }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async getUpdatesByCar(carID: string) {
    const { data, error } = await supabase
      .from('serviceupdates')
      .select('suid, carid, createdat, description')
      .eq('carid', carID)
      .order('createdat', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  }

  static async deleteServiceUpdate(updateID: string, userID: string) {
    const { data: update, error } = await supabase
      .from('serviceupdates')
      .select('suid, carid')
      .eq('suid', updateID)
      .single();

    if (error) throw new Error(error.message);
    if (!update) throw new Error('Update not found');

    const { data: car, error: carError } = await supabase
      .from('cars')
      .select('userid')
      .eq('carid', update.carid)
      .single();

    if (carError) throw new Error(carError.message);
    if (car?.userid !== userID) {
      throw new Error('Not authorized to delete this update');
    }

    await supabase.from('mods').delete().eq('suid', updateID);

    const { data: deleted, error: deleteError } = await supabase
      .from('serviceupdates')
      .delete()
      .eq('suid', updateID)
      .select('suid')
      .single();

    if (deleteError) throw new Error(deleteError.message);
    return deleted;
  }
}
