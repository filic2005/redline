import express, { Request, Response } from 'express';
import { PostServices } from '../modelServices/postServices.js';
import { AuthedRequest } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', async (req: AuthedRequest, res) => {
    const { caption } = req.body;
    const userID = req.userID;

    if (!userID) {
        res.status(401).json({ error: 'Unauthorized: no user ID' });
        return;
    }

    try {
        const newPost = await PostServices.createPost(userID, caption);
        res.status(201).json(newPost);
        return;
    } catch (err) {
        console.error('Create post error:', err);
        res.status(500).json({ error: 'Failed to create post' });
        return;
    }
});

router.get('/:userID', async (req: Request, res: Response) => {
  const { userID } = req.params;

  try {
    const posts = await PostServices.getPostsByUser(userID);
    res.status(200).json(posts);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
    return;
  }
});

router.delete('/:postID', async (req: AuthedRequest, res) => {
    const { postID } = req.params;
    const userID = req.userID;

    if (!userID) {
        res.status(401).json({ error: 'Unauthorized: no user ID' });
        return;
    }

    try {
        const deleted = await PostServices.deletePost(postID, userID);
        if (!deleted) {
            return void res.status(403).json({ error: 'Not authorized to delete this post' });
        }
        res.status(201).json(deleted);
        return;
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete post' });
        return;
    }
});

export default router;