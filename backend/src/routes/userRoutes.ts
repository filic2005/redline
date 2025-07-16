import express from 'express';
import { UserServices } from '../modelServices/userServices.js';
import { AuthedRequest } from '../middleware/authMiddleware.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 👇 Public: Sign up route — DO NOT require auth
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
    const newUser = await UserServices.createUserWithID(userID, username, email, bio);
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
    const user = await UserServices.getUserById(userID);
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
    const user = await UserServices.getUserByUsername(username);
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
router.use((req: AuthedRequest, res, next) => {
  if (!req.userID) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
});

// 🔒 Auth-protected routes
router.patch('/bio', async (req: AuthedRequest, res) => {
  const updated = await UserServices.updateBio(req.userID!, req.body.newBio);
  res.status(200).json(updated);
});

router.patch('/username', async (req: AuthedRequest, res) => {
  try {
    const updated = await UserServices.changeUsername(req.userID!, req.body.newUsername);
    res.status(200).json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to change username' });
  }
});

router.delete('/', async (req: AuthedRequest, res) => {
  await UserServices.deleteUser(req.userID!);
  res.status(204).send();
});

export default router;