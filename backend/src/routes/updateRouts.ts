import express from 'express';
import { UpdateServices } from '../modelServices/updateServices.js';
import { AuthedRequest } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a service update
router.post('/', async (req: AuthedRequest, res) => {
  const { carID, createdAt, description } = req.body;
  const userID = req.userID;

  if (!userID) {
    res.status(401).json({ error: 'Unauthorized: no user ID' });
    return;
  }

  try {
    const newUpdate = await UpdateServices.createServiceUpdate(userID, carID, new Date(createdAt), description);
    res.status(201).json(newUpdate);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create service update' });
    return;
  }
});

// Get all updates by car
router.get('/:carID', async (req, res) => {
  const { carID } = req.params;

  try {
    const updates = await UpdateServices.getUpdatesByCar(carID);
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
    const deleted = await UpdateServices.deleteServiceUpdate(updateID, userID);
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