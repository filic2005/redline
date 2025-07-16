import express from 'express';
import { ImageService } from '../modelServices/imageServices.js';
import { AuthedRequest } from '../middleware/authMiddleware.js';

const router = express.Router();

// Add image to a car or post
router.post('/', async (req: AuthedRequest, res) => {
  const { carID, postID, url } = req.body;
  const userID = req.userID;

  if (!userID) {
    res.status(401).json({ error: 'Unauthorized: no user ID' });
    return;
  }

  try {
    const newImage = await ImageService.addImage(carID, postID, url);
    res.status(201).json(newImage);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to add image' });
    return;
  }
});

// Get all images for a specific post (public)
router.get('/post/:postID', async (req, res) => {
  const { postID } = req.params;

  try {
    const images = await ImageService.getImagesByPost(postID);
    res.status(200).json(images);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch images' });
    return;
  }
});

// Delete image
router.delete('/:imageID', async (req: AuthedRequest, res) => {
  const { imageID } = req.params;
  const userID = req.userID;

  if (!userID) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const deleted = await ImageService.deleteImage(imageID, userID);
    if (!deleted) {
      res.status(403).json({ error: 'Not authorized or image not found' });
      return;
    }
    res.status(200).json(deleted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete image' });
    return;
  }
});

export default router;