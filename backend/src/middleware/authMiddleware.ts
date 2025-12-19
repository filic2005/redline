import dotenv from 'dotenv';
dotenv.config();
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET!;
console.log('JWT_SECRET in authMiddleware:', JWT_SECRET);

export interface AuthedRequest extends Request {
  userID?: string;
}

export function authenticate(req: AuthedRequest, res: Response, next: NextFunction): void {

  if (req.method === 'OPTIONS') {
    next();
    return;
  }
  
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid token' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    console.log('Verified payload:', payload);
    req.userID = (payload as any).sub;
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    res.status(403).json({ error: 'Invalid token' });
    return;
  }
}
