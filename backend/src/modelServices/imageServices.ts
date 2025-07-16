import { db } from '../../database/database.ts';

export class ImageService {
  static async addImage(carID: string, postID: string, url: string) {
    const result = await db.query(
      `INSERT INTO images (carID, postID, url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [carID, postID, url]
    );
    return result.rows[0];
  }

  static async getImagesByPost(postID: string) {
    const result = await db.query(
      `SELECT * FROM images WHERE postID = $1`,
      [postID]
    );
    return result.rows;
  }

  static async deleteImage(imageID: string, userID: string) {
    const result = await db.query(
        `
        DELETE FROM images
        USING users
        WHERE images.imageID = $1
          AND images.userID = users.userID
          AND users.userID = $2
        RETURNING images.*;
        `,
        [imageID, userID]
    );
    return result.rows[0];
  }
}
