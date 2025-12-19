import express from 'express';
import { ImageRepo } from '../repos/imageRepo.ts';
import { AuthedRequest } from '../middleware/authMiddleware.ts';
import { CarRepo } from '../repos/carRepo.ts';
import { PostRepo } from '../repos/postRepo.ts';

const router = express.Router();

// Add image to a car or post
router.post('/', async (req: AuthedRequest, res) => {
  const { carID = null, postID = null, url } = req.body;
  const userID = req.userID;

  if (!userID) {
    res.status(401).json({ error: 'Unauthorized: no user ID' });
    return;
  }

  try {
    if (!url) {
      res.status(400).json({ error: 'Image URL is required' });
      return;
    }

    if (carID) {
      const car = await CarRepo.getCarById(carID);
      if (!car || car.userid !== userID) {
        res.status(403).json({ error: 'Not authorized to add images to this car' });
        return;
      }
    }

    if (postID) {
      const post = await PostRepo.getPostWithMeta(postID);
      if (!post || post.userid !== userID) {
        res.status(403).json({ error: 'Not authorized to add images to this post' });
        return;
      }
    }

    const newImage = await ImageRepo.addImage(carID, postID, url);
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
    const images = await ImageRepo.getImagesByPost(postID);
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
    const deleted = await ImageRepo.deleteImage(imageID, userID);
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
