import { supabase } from '../utils/supabaseClient.ts';

export class ImageRepo {
  static async addImage(carID: string | null, postID: string | null, url: string) {
    const { data, error } = await supabase
      .from('images')
      .insert([{ carid: carID, postid: postID, url }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async getImagesByPost(postID: string) {
    const { data, error } = await supabase
      .from('images')
      .select('imageid, url')
      .eq('postid', postID);

    if (error) throw new Error(error.message);
    return data ?? [];
  }

  static async deleteImage(imageID: string, userID: string) {
    const { data: image, error } = await supabase
      .from('images')
      .select('imageid, carid, postid')
      .eq('imageid', imageID)
      .single();

    if (error) throw new Error(error.message);
    if (!image) return null;

    if (image.postid) {
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select('userid')
        .eq('postid', image.postid)
        .single();
      if (postError) throw new Error(postError.message);
      if (post?.userid !== userID) {
        throw new Error('Not authorized to delete this image');
      }
    }

    if (image.carid) {
      const { data: car, error: carError } = await supabase
        .from('cars')
        .select('userid')
        .eq('carid', image.carid)
        .single();
      if (carError) throw new Error(carError.message);
      if (car?.userid !== userID) {
        throw new Error('Not authorized to delete this image');
      }
    }

    const { data: deleted, error: deleteError } = await supabase
      .from('images')
      .delete()
      .eq('imageid', imageID)
      .select('imageid')
      .single();

    if (deleteError) throw new Error(deleteError.message);
    return deleted;
  }
}
