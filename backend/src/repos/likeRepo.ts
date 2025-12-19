import { supabase } from '../utils/supabaseClient.ts';

export class LikeRepo {
  static async likePost(userID: string, postID: string) {
    const { error } = await supabase
      .from('likes')
      .insert([{ userid: userID, postid: postID }]);

    if (error && error.code !== '23505') {
      throw new Error(error.message);
    }
    return true;
  }

  static async unlikePost(userID: string, postID: string) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .match({ userid: userID, postid: postID });

    if (error) throw new Error(error.message);
    return true;
  }

  static async countLikes(postID: string) {
    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('postid', postID);

    if (error) throw new Error(error.message);
    return count ?? 0;
  }

  static async hasLiked(postID: string, userID: string) {
    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .match({ postid: postID, userid: userID });

    if (error) throw new Error(error.message);
    return (count ?? 0) > 0;
  }
}
