import { db } from '../../database/database.ts';

export class CommentService {
  static async addComment(postID: string, userID: string, text: string) {
    const result = await db.query(
      `INSERT INTO comments (postID, userID, text)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [postID, userID, text]
    );
    return result.rows[0];
  }

  static async getCommentsByPost(postID: string) {
    const result = await db.query(
      `SELECT * FROM comments WHERE postID = $1`,
      [postID]
    );
    return result.rows;
  }

  static async deleteComment(commentID: string, userID: string) {
    const result = await db.query(
        `
        DELETE FROM comments
        USING users
        WHERE comments.commentID = $1
          AND comments.userID = users.userID
          AND users.userID = $2
        RETURNING comments.*;
        `,
        [commentID, userID]
    );
    return result.rows[0];
  }
}