import express from 'express';
import { UserRepo } from '../repos/userRepo.ts';
import { AuthedRequest, authenticate } from '../middleware/authMiddleware.ts';
import { supabase } from '../utils/supabaseClient.ts';

const router = express.Router();

// Sign up route — DO NOT require auth
router.post('/signup', async (req, res) => {
  const { email, password, username, bio = '' } = req.body;

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username },
    });

    if (error || !data.user) {
      res.status(400).json({ error: error?.message || 'Failed to create Supabase user' });
      return;
    }

    const userID = data.user.id;
    const newUser = await UserRepo.createUserWithID(userID, username, email, bio);
    res.status(201).json({ message: 'User created', user: newUser });
    return;
  } catch (err) {
    res.status(500).json({ error: 'Server error during signup' });
    return;
  }
});

// 👇 PUBLIC: Get user by ID/username (optional — your call)
router.get('/id/:userID', async (req, res) => {
  const { userID } = req.params;
  try {
    const user = await UserRepo.getUserById(userID);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(200).json(user);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
    return;
  }
});

router.get('/username/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const user = await UserRepo.getUserByUsername(username);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(200).json(user);
    return;
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
    return;
  }
});

// 🔒 Middleware: Require auth for routes below
router.use(authenticate);

// 🔒 Auth-protected routes
router.post('/ensure', async (req: AuthedRequest, res) => {
  try {
    const existing = await UserRepo.getUserById(req.userID!);
    if (existing) {
      res.status(200).json(existing);
      return;
    }

    const { username, email, bio = '' } = req.body;
    if (!username || !email) {
      res.status(400).json({ error: 'Username and email are required to create a profile' });
      return;
    }

    const created = await UserRepo.createUserWithID(req.userID!, username, email, bio);
    res.status(201).json(created);
  } catch (err: any) {
    const message = err?.message || 'Failed to ensure user profile';
    const isConflict = typeof message === 'string' && message.toLowerCase().includes('duplicate key');
    res.status(isConflict ? 400 : 500).json({ error: isConflict ? 'Username already taken' : message });
  }
});

router.patch('/bio', async (req: AuthedRequest, res) => {
  const updated = await UserRepo.updateBio(req.userID!, req.body.newBio);
  res.status(200).json(updated);
});

router.patch('/profile', async (req: AuthedRequest, res) => {
  try {
    const updated = await UserRepo.updateProfile(req.userID!, req.body);
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.patch('/username', async (req: AuthedRequest, res) => {
  try {
    const updated = await UserRepo.changeUsername(req.userID!, req.body.newUsername);
    res.status(200).json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to change username' });
  }
});

router.delete('/', async (req: AuthedRequest, res) => {
  await UserRepo.deleteUser(req.userID!);
  res.status(204).send();
});

export default router;
