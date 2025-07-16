import { db } from '../../database/database.ts';

export class LikeService {
  static async likePost(userID: string, postID: string) {
    const result = await db.query(
      `INSERT INTO likes (userID, postID)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [userID, postID]
    );

    return (result.rowCount ?? 0) > 0;
  }

  static async unlikePost(userID: string, postID: string) {
    const result = await db.query(
      `DELETE FROM likes WHERE userID = $1 AND postID = $2`,
      [userID, postID]
    );
    return (result.rowCount ?? 0) > 0;;
  }

  static async countLikes(postID: string) {
    const result = await db.query(
      `SELECT COUNT(*) FROM likes WHERE postID = $1`,
      [postID]
    );
    return parseInt(result.rows[0].count, 10);
  }
}