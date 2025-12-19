import { supabase } from '../utils/supabaseClient.ts';

export interface ModPayload {
  name: string;
  type: string;
  mileage: number;
  description: string;
}

export class ModRepo {
  static async createMods(carID: string, suID: string, mods: ModPayload[]) {
    if (!mods.length) return [];

    const rows = mods.map((mod) => ({
      carid: carID,
      suid: suID,
      name: mod.name,
      type: mod.type,
      mileage: mod.mileage,
      description: mod.description,
    }));

    const { data, error } = await supabase
      .from('mods')
      .insert(rows)
      .select();

    if (error) throw new Error(error.message);
    return data ?? [];
  }

  static async getModsByCar(carID: string) {
    const { data, error } = await supabase
      .from('mods')
      .select('modid, suid, carid, name, type, mileage, description')
      .eq('carid', carID)
      .order('mileage', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  }

  static async deleteMod(modID: string, userID: string) {
    const { data: mod, error } = await supabase
      .from('mods')
      .select('modid, carid')
      .eq('modid', modID)
      .single();

    if (error) throw new Error(error.message);
    if (!mod) throw new Error('Mod not found');

    const { data: car, error: carError } = await supabase
      .from('cars')
      .select('userid')
      .eq('carid', mod.carid)
      .single();

    if (carError) throw new Error(carError.message);
    if (car?.userid !== userID) {
      throw new Error('Not authorized to delete this mod');
    }

    const { data: deleted, error: deleteError } = await supabase
      .from('mods')
      .delete()
      .eq('modid', modID)
      .select('modid')
      .single();

    if (deleteError) throw new Error(deleteError.message);
    return deleted;
  }
}
