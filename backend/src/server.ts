import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { authenticate } from './middleware/authMiddleware.ts';
import cors from 'cors';


const app = express();
app.use(express.json());
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://redline-eight.vercel.app',
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.get('/ping', (_req, res) => {
  console.log('Ping hit');
  res.send('pong');
});

// Route imports
import postRoutes from './routes/postRoutes.ts';
import carRoutes from './routes/carRoutes.ts';
import modRoutes from './routes/modRoutes.ts';
import updateRoutes from './routes/updateRoutes.ts';
import userRoutes from './routes/userRoutes.ts';
import likeRoutes from './routes/likeRoutes.ts';
import imageRoutes from './routes/imageRoutes.ts';
import followRoutes from './routes/followRoutes.ts';
import commentRoutes from './routes/commentRoutes.ts';


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

// Centralized error handler
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(`[${req.method}] ${req.originalUrl} —`, err);
  const status = err?.status || 500;
  res.status(status).json({
    error: err?.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && err?.stack ? { stack: err.stack } : {}),
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
