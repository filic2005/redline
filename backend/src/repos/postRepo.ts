import { supabase } from '../utils/supabaseClient.ts';
import { FollowRepo } from './followRepo.ts';
import { LikeRepo } from './likeRepo.ts';
import { CommentRepo } from './commentRepo.ts';

const POST_SELECT = 'postid, caption, userid, createdat, images(url), users:posts_userid_fkey(username, url, filename)';

export interface FeedOptions {
  feedType: 'all' | 'following';
  cursorCreatedAt?: string;
  cursorPostId?: string;
  limit?: number;
}

export class PostRepo {
  static async createPost(userID: string, caption: string) {
    const { data, error } = await supabase
      .from('posts')
      .insert([{ userid: userID, caption }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async getPostsByUser(userID: string) {
    const { data, error } = await supabase
      .from('posts')
      .select('postid, caption, createdat, images(url)')
      .eq('userid', userID)
      .order('createdat', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  }

  static async getPostWithMeta(postID: string) {
    const { data, error } = await supabase
      .from('posts')
      .select(POST_SELECT)
      .eq('postid', postID)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async getFeed(userID: string, options: FeedOptions) {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const limit = options.limit ?? 5;

    let query = supabase
      .from('posts')
      .select(POST_SELECT)
      .gte('createdat', twoWeeksAgo.toISOString())
      .order('createdat', { ascending: false })
      .order('postid', { ascending: false })
      .limit(limit);

    if (options.feedType === 'following') {
      const followeeIDs = await FollowRepo.getFollowingIds(userID);
      if (!followeeIDs.length) {
        return [];
      }
      query = query.in('userid', followeeIDs);
    }

    if (options.cursorCreatedAt && options.cursorPostId) {
      query = query.or(
        `createdat.lt.${options.cursorCreatedAt},and(createdat.eq.${options.cursorCreatedAt},postid.lt.${options.cursorPostId})`
      );
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const posts = data ?? [];
    const enriched = await Promise.all(
      posts.map(async (post) => {
        const [likeCount, commentCount, hasLiked] = await Promise.all([
          LikeRepo.countLikes(post.postid),
          CommentRepo.countComments(post.postid),
          LikeRepo.hasLiked(post.postid, userID),
        ]);

        return {
          postid: post.postid,
          caption: post.caption,
          userid: post.userid,
          createdat: post.createdat,
          images: post.images ?? [],
          user: Array.isArray(post.users) ? post.users[0] : post.users,
          likeCount,
          commentCount,
          hasLiked,
        };
      })
    );

    return enriched;
  }

  static async deletePost(postID: string, userID: string) {
    const { data, error } = await supabase
      .from('posts')
      .delete()
      .match({ postid: postID, userid: userID })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
