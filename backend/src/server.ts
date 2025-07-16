import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { authenticate } from './middleware/authMiddleware.js';


const app = express();
app.use(express.json());

app.get('/ping', (_req, res) => {
  console.log('Ping hit');
  res.send('pong');
});

// Route imports
import postRoutes from './routes/postRoutes.js';
import carRoutes from './routes/carRoutes.js';
import modRoutes from './routes/modRoutes.js';
import updateRoutes from './routes/updateRoutes.js';
import userRoutes from './routes/userRoutes.js';
import likeRoutes from './routes/likeRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import followRoutes from './routes/followRoutes.js';
import commentRoutes from './routes/commentRoutes.js';


// Route mounting — all authenticated
app.use('/api/posts', authenticate, postRoutes);
app.use('/api/cars', authenticate, carRoutes);
app.use('/api/mods', authenticate, modRoutes);
app.use('/api/updates', authenticate, updateRoutes);
app.use('/api/users', userRoutes);
app.use('/api/likes', authenticate, likeRoutes);
app.use('/api/images', authenticate, imageRoutes);
app.use('/api/follows', authenticate, followRoutes);
app.use('/api/comments', authenticate, commentRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});