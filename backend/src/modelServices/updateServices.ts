import { db } from '../../database/database.ts';

export class UpdateServices {
    static async createServiceUpdate(userID: string, carID: string, createdAt: Date, description: string) {
        const result = await db.query(
      `     INSERT INTO serviceupdates (userID, carID, createdAt, description)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [userID, carID, createdAt, description]
        );
        return result.rows[0];
    }

    static async getUpdatesByCar(carID: string) {
        const result = await db.query(
            `
            SELECT su.*
            FROM serviceupdates su
            JOIN cars c ON su.carID = c.carID
            JOIN users u ON u.userID = c.userID
            WHERE u.username = $1 AND c.carID = $2`,
            [carID]
        )
        return result.rows;
    }

    static async deleteServiceUpdate(updateID: string, userID: string) {
    const result = await db.query(
        `
        DELETE FROM serviceupdates
        USING cars, users
        WHERE serviceupdates.updateID = $1
          AND serviceupdates.carID = cars.carID
          AND cars.userID = users.userID
          AND users.userID = $2
        RETURNING serviceupdates.*;
        `,
        [updateID, userID]
    );
    return result.rows[0];
}
}