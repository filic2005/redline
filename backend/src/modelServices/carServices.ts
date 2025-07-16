import { db } from '../../database/database.ts';

export class CarServices {

    static async createCar(userID: string, make: string, model: string, year: number) {
        const result = await db.query(
      `     INSERT INTO cars (userID, make, model, year)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [userID, make, model, year]
        );
        return result.rows[0];
    }

    static async getCarsByUserID(userID: string) {
        const result = await db.query(
            `
            SELECT *
            FROM cars
            WHERE userID = $1
            `,
            [userID]
        );
        return result.rows;
    }

    static async deleteCar(carID: string, userID: string) {
        const result = await db.query(
            `
            DELETE FROM cars
            USING users
            WHERE cars.carID = $1
              AND cars.userID = users.userID
              AND users.userID = $2
            RETURNING cars.*;
        `   ,
            [carID, userID]
        );
        return result.rows[0];
    }
}