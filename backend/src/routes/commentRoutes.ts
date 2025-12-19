import express from 'express';
import { CommentRepo } from '../repos/commentRepo.ts';
import { AuthedRequest } from '../middleware/authMiddleware.ts';

const router = express.Router();

// Add a comment
router.post('/:postID', async (req: AuthedRequest, res) => {
  const { postID } = req.params;
  const { text } = req.body;
  const userID = req.userID;

  if (!userID || !text) {
    res.status(400).json({ error: 'Missing user ID or comment text' });
    return;
  }

  try {
    const comment = await CommentRepo.addComment(postID, userID, text);
    res.status(201).json(comment);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' });
    return;
  }
});

// Get all comments for a post
router.get('/:postID', async (req, res) => {
  const { postID } = req.params;

  try {
    const comments = await CommentRepo.getCommentsByPost(postID);
    res.status(200).json(comments);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments' });
    return;
  }
});

// Delete a comment
router.delete('/:commentID', async (req: AuthedRequest, res) => {
  const { commentID } = req.params;
  const userID = req.userID;

  if (!userID) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const deleted = await CommentRepo.deleteComment(commentID, userID);
    if (!deleted) {
      res.status(403).json({ error: 'Not authorized to delete this comment' });
      return;
    }
    res.status(200).json(deleted);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete comment' });
    return;
  }
});

export default router;
