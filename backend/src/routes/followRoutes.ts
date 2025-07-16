import express from 'express';
import { FollowService } from '../modelServices/followServices.js';
import { AuthedRequest } from '../middleware/authMiddleware.js';

const router = express.Router();

// Follow a user
router.post('/:followeeID', async (req: AuthedRequest, res) => {
  const followerID = req.userID;
  const { followeeID } = req.params;

  if (!followerID) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const followed = await FollowService.followUser(followerID, followeeID);
    res.status(200).json({ followed });
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to follow user' });
    return;
  }
});

// Unfollow a user
router.delete('/:followeeID', async (req: AuthedRequest, res) => {
  const followerID = req.userID;
  const { followeeID } = req.params;

  if (!followerID) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const unfollowed = await FollowService.unfollowUser(followerID, followeeID);
    res.status(200).json({ unfollowed });
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to unfollow user' });
    return;
  }
});

// Get followers of a user
router.get('/followers/:userID', async (req, res) => {
  const { userID } = req.params;

  try {
    const followers = await FollowService.getFollowers(userID);
    res.status(200).json(followers);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to get followers' });
    return;
  }
});

// Get users the user is following
router.get('/following/:userID', async (req, res) => {
  const { userID } = req.params;

  try {
    const following = await FollowService.getFollowing(userID);
    res.status(200).json(following);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to get following list' });
    return;
  }
});

export default router;