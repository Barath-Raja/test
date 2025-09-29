
import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'necadmin';

console.log('JWT_SECRET used in auth middleware:', JWT_SECRET);

export const authenticateToken = (req, res, next) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader?.split(' ')[1];

  console.log('Authorization header:', authHeader);
  console.log('Token extracted:', token);

  if (!token) return res.status(401).json({ error: 'Access token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(403).json({ error: 'Invalid token' });
    }
    console.log('Decoded user from token:', user);
    req.user = user;
    next();
  });
};
