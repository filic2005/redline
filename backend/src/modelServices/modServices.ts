import { db } from '../../database/database.ts';

export class ModServices {
    static async createMod(userID: string, carID: string, createdAt: Date, description: string, name: string, type: string, mileage: number) {
        // Insert into serviceupdates first
        const suResult = await db.query(
                `
                INSERT INTO serviceupdates (userID, carID, createdAt, description)
                VALUES ($1, $2, $3, $4)
                RETURNING suID
                `,
                [userID, carID, createdAt, description]
        );

        const suID = suResult.rows[0].suid;

        // Insert into modifications
        const modResult = await db.query(
            `
            INSERT INTO modifications (suID, carID, name, type, mileage, description)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            `,
            [suID, carID, name, type, mileage, description]
        );

        return modResult.rows[0];
    }

    static async getModsByCar(carID: string) {
        const result = await db.query(
            `
            SELECT m.*, su.createdAt
            FROM modifications m
            JOIN serviceupdates su ON m.suID = su.suID
            WHERE m.carID = $1
            ORDER BY su.createdAt DESC
            `,
            [carID]
        );
        return result.rows;
    }

    static async deleteMod(modID: string, userID: string) {
        const result = await db.query(
            `
            DELETE FROM mods
            USING cars, users
            WHERE mods.modID = $1
            AND mods.carID = cars.carID
            AND cars.userID = users.userID
            AND users.userID = $2
            RETURNING mods.*
            `,
            [modID, userID]
        );
        return result.rows[0]; // Will be undefined if not authorized
    }
}