import express, { Request, Response } from 'express';
import { CarServices } from '../modelServices/carServices.js';
import { AuthedRequest } from '../middleware/authMiddleware.js';


const router = express.Router();

router.post('/', async (req: AuthedRequest, res) => {
    const { make, model, year } = req.body;
    const userID = req.userID;

    if (!userID) {
        res.status(401).json({ error: 'Unauthorized: no user ID' });
        return;
    }

    try {
        const newPost = await CarServices.createCar(userID, make, model, year);
        res.status(201).json(newPost);
        return;
    } catch (err) {
        res.status(500).json({ error: 'Failed to create car' });
        return;
    }
});

router.get('/:userID', async (req: Request, res: Response) => {
  const { userID } = req.params;

  try {
    const posts = await CarServices.getCarsByUserID(userID);
    res.status(200).json(posts);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
    return;
  }
});

router.delete('/:carID', async (req: AuthedRequest, res) => {
    const { carID } = req.params;
    const userID = req.userID;

    if (!userID) {
        res.status(401).json({ error: 'Unauthorized: no user ID' });
        return;
    }

    try {
        const deleted = await CarServices.deleteCar(carID, userID);
        if (!deleted) {
            return void res.status(403).json({ error: 'Not authorized to delete this car' });
        }
        res.status(201).json(deleted);
        return;
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete car' });
        return;
    }
});

export default router;

