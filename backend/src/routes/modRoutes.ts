import express, { Request, Response } from 'express';
import { ModRepo } from '../repos/modRepo.ts';
import { AuthedRequest } from '../middleware/authMiddleware.ts';
import { CarRepo } from '../repos/carRepo.ts';


const router = express.Router();

router.post('/', async (req: AuthedRequest, res) => {
  const { carID, suID, mods = [] } = req.body;
  const userID = req.userID;

  if (!userID) {
    res.status(401).json({ error: 'Unauthorized: no user ID' });
    return;
  }

  if (!carID || !suID || !Array.isArray(mods)) {
    res.status(400).json({ error: 'carID, suID, and mods array are required' });
    return;
  }

  try {
    const car = await CarRepo.getCarById(carID);
    if (!car || car.userid !== userID) {
      res.status(403).json({ error: 'Not authorized to add mods to this car' });
      return;
    }

    const normalizedMods = mods
      .filter((mod: any) => mod?.name)
      .map((mod: any) => ({
        name: mod.name,
        type: mod.type,
        mileage: Number(mod.mileage) || 0,
        description: mod.description || '',
      }));

    const created = await ModRepo.createMods(carID, suID, normalizedMods);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create mods' });
  }
});

router.get('/:carID', async (req: Request, res: Response) => {
  const { carID } = req.params;

  try {
    const posts = await ModRepo.getModsByCar(carID);
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
        const deleted = await ModRepo.deleteMod(modID, userID);
        if (!deleted) {
            return void res.status(403).json({ error: 'Not authorized to delete this mod' });
        }
        res.status(200).json(deleted);
        return;
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete mod' });
        return;
    }
});

export default router;
