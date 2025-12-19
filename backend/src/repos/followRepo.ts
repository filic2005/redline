import { supabase } from '../utils/supabaseClient.ts';

interface FollowUser {
  userid: string;
  username: string;
  url: string | null;
}

export class FollowRepo {
  static async followUser(followerID: string, followeeID: string) {
    if (followerID === followeeID) {
      throw new Error('Cannot follow yourself');
    }

    const { error } = await supabase
      .from('follows')
      .insert([{ followerid: followerID, followeeid: followeeID }]);

    if (error && error.code !== '23505') { // ignore conflict
      throw new Error(error.message);
    }
    return true;
  }

  static async unfollowUser(followerID: string, followeeID: string) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .match({ followerid: followerID, followeeid: followeeID });

    if (error) throw new Error(error.message);
    return true;
  }

  static async getFollowers(userID: string) {
    const { data, error } = await supabase
      .from('follows')
      .select('followerid')
      .eq('followeeid', userID);

    if (error) throw new Error(error.message);
    const ids = (data ?? []).map((row) => row.followerid);
    if (!ids.length) return [];

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('userid, username, url')
      .in('userid', ids);

    if (usersError) throw new Error(usersError.message);
    return users ?? [];
  }

  static async getFollowing(userID: string) {
    const { data, error } = await supabase
      .from('follows')
      .select('followeeid')
      .eq('followerid', userID);

    if (error) throw new Error(error.message);
    const ids = (data ?? []).map((row) => row.followeeid);
    if (!ids.length) return [];

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('userid, username, url')
      .in('userid', ids);

    if (usersError) throw new Error(usersError.message);
    return users ?? [];
  }

  static async getFollowingIds(userID: string) {
    const { data, error } = await supabase
      .from('follows')
      .select('followeeid')
      .eq('followerid', userID);

    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => row.followeeid);
  }
}
