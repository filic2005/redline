import express, { Request, Response } from 'express';
import { CarRepo } from '../repos/carRepo.ts';
import { AuthedRequest } from '../middleware/authMiddleware.ts';


const router = express.Router();

router.post('/', async (req: AuthedRequest, res) => {
    const { make, model, year, url = null, filename = null } = req.body;
    const userID = req.userID;

    if (!userID) {
        res.status(401).json({ error: 'Unauthorized: no user ID' });
        return;
    }

    try {
        const newCar = await CarRepo.createCar(userID, make, model, year, url, filename);
        res.status(201).json(newCar);
        return;
    } catch (err) {
        res.status(500).json({ error: 'Failed to create car' });
        return;
    }
});

router.get('/detail/:carID', async (req: Request, res: Response) => {
  const { carID } = req.params;

  try {
    const car = await CarRepo.getCarById(carID);
    if (!car) {
      res.status(404).json({ error: 'Car not found' });
      return;
    }
    res.status(200).json(car);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch car' });
  }
});

router.get('/search', async (req: Request, res: Response) => {
  const { make, model, year } = req.query;
  const parsedYear = year !== undefined ? Number(year) : undefined;

  if (year !== undefined && Number.isNaN(parsedYear)) {
    res.status(400).json({ error: 'Year must be a number' });
    return;
  }

  if (!make && !model && parsedYear === undefined) {
    res.status(400).json({ error: 'Provide at least one filter to search' });
    return;
  }

  try {
    const cars = await CarRepo.searchCars({
      make: make as string | undefined,
      model: model as string | undefined,
      year: parsedYear,
    });
    res.status(200).json(cars);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search cars' });
  }
});

router.get('/user/:userID', async (req: Request, res: Response) => {
  const { userID } = req.params;

  try {
    const cars = await CarRepo.getCarsByUserID(userID);
    res.status(200).json(cars);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cars' });
    return;
  }
});

router.patch('/:carID', async (req: AuthedRequest, res) => {
  const { carID } = req.params;
  const userID = req.userID;

  if (!userID) {
    res.status(401).json({ error: 'Unauthorized: no user ID' });
    return;
  }

  try {
    const updated = await CarRepo.updateCar(carID, userID, req.body);
    if (!updated) {
      res.status(403).json({ error: 'Not authorized to update this car' });
      return;
    }
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update car' });
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
        const deleted = await CarRepo.deleteCar(carID, userID);
        if (!deleted) {
            return void res.status(403).json({ error: 'Not authorized to delete this car' });
        }
        res.status(200).json(deleted);
        return;
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete car' });
        return;
    }
});

export default router;
