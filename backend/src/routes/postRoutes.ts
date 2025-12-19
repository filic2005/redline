import express, { Request, Response } from 'express';
import { PostRepo } from '../repos/postRepo.ts';
import { AuthedRequest } from '../middleware/authMiddleware.ts';
import { LikeRepo } from '../repos/likeRepo.ts';
import { CommentRepo } from '../repos/commentRepo.ts';

const router = express.Router();

router.post('/', async (req: AuthedRequest, res) => {
    const { caption } = req.body;
    const userID = req.userID;

    if (!userID) {
        res.status(401).json({ error: 'Unauthorized: no user ID' });
        return;
    }

    try {
        const newPost = await PostRepo.createPost(userID, caption);
        res.status(201).json(newPost);
        return;
    } catch (err) {
        console.error('Create post error:', err);
        res.status(500).json({ error: 'Failed to create post' });
        return;
    }
});

router.get('/feed', async (req: AuthedRequest, res) => {
  if (!req.userID) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { type = 'all', cursorCreatedAt, cursorPostId, limit } = req.query;

  try {
    const posts = await PostRepo.getFeed(req.userID, {
      feedType: type === 'following' ? 'following' : 'all',
      cursorCreatedAt: cursorCreatedAt as string | undefined,
      cursorPostId: cursorPostId as string | undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.status(200).json(posts);
  } catch (err) {
    console.error('Feed error', err);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

router.get('/user/:userID', async (req: Request, res: Response) => {
  const { userID } = req.params;

  try {
    const posts = await PostRepo.getPostsByUser(userID);
    res.status(200).json(posts);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts' });
    return;
  }
});

router.get('/:postID', async (req: AuthedRequest, res: Response) => {
  const { postID } = req.params;

  try {
    const post = await PostRepo.getPostWithMeta(postID);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    const [likeCount, commentCount, hasLiked] = await Promise.all([
      LikeRepo.countLikes(postID),
      CommentRepo.countComments(postID),
      req.userID ? LikeRepo.hasLiked(postID, req.userID) : Promise.resolve(false),
    ]);

    res.status(200).json({
      ...post,
      likeCount,
      commentCount,
      hasLiked,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch post' });
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
        const deleted = await PostRepo.deletePost(postID, userID);
        if (!deleted) {
            return void res.status(403).json({ error: 'Not authorized to delete this post' });
        }
        res.status(200).json(deleted);
        return;
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete post' });
        return;
    }
});

export default router;
