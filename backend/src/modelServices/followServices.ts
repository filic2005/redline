import { db } from '../../database/database.ts';

export class FollowService {
  static async followUser(followerID: string, followeeID: string) {
    const result = await db.query(
      `INSERT INTO follows (followerID, followeeID)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [followerID, followeeID]
    );
    return (result.rowCount ?? 0) > 0;
  }

  static async unfollowUser(followerID: string, followeeID: string) {
    const result = await db.query(
      `DELETE FROM follows WHERE followerID = $1 AND followeeID = $2`,
      [followerID, followeeID]
    );
    return (result.rowCount ?? 0) > 0;
  }

  static async getFollowers(userID: string) {
    const result = await db.query(
      `SELECT followerID FROM follows WHERE followeeID = $1`,
      [userID]
    );
    return result.rows.map(row => row.followerid);
  }

  static async getFollowing(userID: string) {
    const result = await db.query(
      `SELECT followeeID FROM follows WHERE followerID = $1`,
      [userID]
    );
    return result.rows.map(row => row.followeeid);
  }
}
