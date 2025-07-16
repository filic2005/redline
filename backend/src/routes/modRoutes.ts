import express, { Request, Response } from 'express';
import { ModServices } from '../modelServices/modServices.js';
import { AuthedRequest } from '../middleware/authMiddleware.js';


const router = express.Router();

router.post('/', async (req: AuthedRequest, res) => {
  const { carID, createdAt, description, name, type, mileage } = req.body;
  const userID = req.userID;

  if (!userID) {
    res.status(401).json({ error: 'Unauthorized: no user ID' });
    return;
  }

  try {
    const newMod = await ModServices.createMod(userID, carID, new Date(createdAt), description, name, type, mileage);
    res.status(201).json(newMod);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to create mod' });
    return;
  }
});

router.get('/:carID', async (req: Request, res: Response) => {
  const { carID } = req.params;

  try {
    const posts = await ModServices.getModsByCar(carID);
    res.status(200).json(posts);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mods' });
    return;
  }
});

router.delete('/:modID', async (req: AuthedRequest, res) => {
    const { modID } = req.params;
    const userID = req.userID;

    if (!userID) {
        res.status(401).json({ error: 'Unauthorized: no user ID' });
        return;
    }

    try {
        const deleted = await ModServices.deleteMod(modID, userID);
        if (!deleted) {
            return void res.status(403).json({ error: 'Not authorized to delete this mod' });
        }
        res.status(201).json(deleted);
        return;
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete mod' });
        return;
    }
});

export default router;

