import { db } from '../../database/database.ts';

export class PostServices {
  static async createPost(userID: string, caption: string) {
    const result = await db.query(
      `INSERT INTO posts (userID, caption)
       VALUES ($1, $2)
       RETURNING *`,
      [userID, caption]
    );
    return result.rows[0];
  }

  static async getPostsByUser(userID: string) {
    const result = await db.query(
      `SELECT * FROM posts WHERE userID = $1`,
      [userID]
    );
    return result.rows;
  }

  static async deletePost(postID: string, userID: string) {
    const result = await db.query(
        `
        DELETE FROM posts
        USING users
        WHERE posts.postID = $1
          AND posts.userID = users.userID
          AND users.userID = $2
        RETURNING posts.*;
        `,
        [postID, userID]
    );
    return result.rows[0];
}
}