import express from 'express';
import { ServiceUpdateRepo } from '../repos/serviceUpdateRepo.ts';
import { AuthedRequest } from '../middleware/authMiddleware.ts';
import { CarRepo } from '../repos/carRepo.ts';
import { ModRepo } from '../repos/modRepo.ts';

const router = express.Router();

// Create a service update
router.post('/', async (req: AuthedRequest, res) => {
  const { carID, description, mods = [] } = req.body;
  const userID = req.userID;

  if (!userID) {
    res.status(401).json({ error: 'Unauthorized: no user ID' });
    return;
  }

  try {
    const car = await CarRepo.getCarById(carID);
    if (!car || car.userid !== userID) {
      res.status(403).json({ error: 'Not authorized to add updates to this car' });
      return;
    }

    const newUpdate = await ServiceUpdateRepo.createServiceUpdate(carID, description);
    const createdMods = await ModRepo.createMods(
      carID,
      newUpdate.suid,
      (mods as any[]).filter((mod) => mod?.name).map((mod) => ({
        name: mod.name,
        type: mod.type,
        mileage: Number(mod.mileage) || 0,
        description: mod.description || '',
      }))
    );

    res.status(201).json({ update: newUpdate, mods: createdMods });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create service update' });
    return;
  }
});

// Get all updates by car
router.get('/:carID', async (req, res) => {
  const { carID } = req.params;

  try {
    const updates = await ServiceUpdateRepo.getUpdatesByCar(carID);
    res.status(200).json(updates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch service updates' });
  }
});

// Delete a service update
router.delete('/:updateID', async (req: AuthedRequest, res) => {
  const { updateID } = req.params;
  const userID = req.userID;

  if (!userID) {
    res.status(401).json({ error: 'Unauthorized: no user ID' });
    return;
  }

  try {
    const deleted = await ServiceUpdateRepo.deleteServiceUpdate(updateID, userID);
    if (!deleted) {
      res.status(403).json({ error: 'Not authorized to delete this update' });
      return;
    }
    res.status(200).json(deleted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete service update' });
    return;
  }
});

export default router;
