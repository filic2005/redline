import { db } from '../../database/database.ts';

export class UserServices {
  // Create a new user
  static async createUser(username: string, email: string, bio: string = '') {
    const result = await db.query(
      `INSERT INTO users (username, email, bio)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [username, email, bio]
    );
    return result.rows[0];
  }

  static async createUserWithID(userID: string, username: string, email: string, bio: string) {
    const result = await db.query(
      `INSERT INTO users (userID, username, email, bio)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [userID, username, email, bio]
    );
    return result.rows[0];
  }

  // Get user by ID
  static async getUserById(userID: string) {
    const result = await db.query(
      `SELECT * FROM users WHERE userID = $1`,
      [userID]
    );
    return result.rows[0] || null;
  }

  // Get user by username
  static async getUserByUsername(username: string) {
    const result = await db.query(
      `SELECT * FROM users WHERE username = $1`,
      [username]
    );
    return result.rows[0] || null;
  }

  // Update bio
  static async updateBio(userID: string, newBio: string) {
    const result = await db.query(
      `UPDATE users SET bio = $1 WHERE userID = $2 RETURNING *`,
      [newBio, userID]
    );
    return result.rows[0];
  }

  static async changeUsername(userID: string, newUsername: string) {
    const now = new Date();

    // Check when the username was last changed
    const check = await db.query(
        `SELECT lastUsernameChange FROM users WHERE userID = $1`,
        [userID]
    );

    const lastChange = check.rows[0]?.lastusernamechange;

    if (lastChange && (now.getTime() - new Date(lastChange).getTime()) < 30 * 24 * 60 * 60 * 1000) {
        throw new Error("You can only change your username once every 30 days.");
    }

    // Update username and lastUsernameChange
    const result = await db.query(
        `UPDATE users 
        SET username = $1, lastUsernameChange = CURRENT_TIMESTAMP
        WHERE userID = $2
        RETURNING *`,
        [newUsername, userID]
    );

    return result.rows[0];
}

  // Delete user
  static async deleteUser(userID: string) {
    await db.query(
      `DELETE FROM users WHERE userID = $1`,
      [userID]
    );
    return true;
  }
}
