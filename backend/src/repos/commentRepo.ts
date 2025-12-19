import { supabase } from '../utils/supabaseClient.ts';

export class CommentRepo {
  static async addComment(postID: string, userID: string, text: string) {
    const { data, error } = await supabase
      .from('comments')
      .insert([{ postid: postID, userid: userID, text }])
      .select('commentid, text, createdat, userid')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async getCommentsByPost(postID: string) {
    const { data, error } = await supabase
      .from('comments')
      .select('commentid, text, createdat, userid, users(username, url)')
      .eq('postid', postID)
      .order('createdat', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  }

  static async deleteComment(commentID: string, userID: string) {
    const { data, error } = await supabase
      .from('comments')
      .delete()
      .match({ commentid: commentID, userid: userID })
      .select('commentid')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async countComments(postID: string) {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('postid', postID);

    if (error) throw new Error(error.message);
    return count ?? 0;
  }
}
