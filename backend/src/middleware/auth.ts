import { NextFunction, Request, Response } from 'express';
import { supabaseAuth } from '../supabase.js';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'missing_token' });
  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data.user) return res.status(401).json({ error: 'invalid_token' });
  req.userId = data.user.id;
  next();
}
