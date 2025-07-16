import express from 'express';
import { LikeService } from '../modelServices/likeServices.js';
import { AuthedRequest } from '../middleware/authMiddleware.js';

const router = express.Router();

// Like a post
router.post('/:postID', async (req: AuthedRequest, res) => {
  const userID = req.userID;
  const { postID } = req.params;

  if (!userID) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const liked = await LikeService.likePost(userID, postID);
    res.status(200).json({ liked });
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to like post' });
    return;
  }
});

// Unlike a post
router.delete('/:postID', async (req: AuthedRequest, res) => {
  const userID = req.userID;
  const { postID } = req.params;

  if (!userID) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const unliked = await LikeService.unlikePost(userID, postID);
    res.status(200).json({ unliked });
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to unlike post' });
    return;
  }
});

// Count likes on a post (public endpoint)
router.get('/count/:postID', async (req, res) => {
  const { postID } = req.params;

  try {
    const count = await LikeService.countLikes(postID);
    res.status(200).json({ count });
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to count likes' });
    return;
  }
});

export default router;