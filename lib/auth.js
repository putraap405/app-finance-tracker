import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
export function signJwt(payload, opts={}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: opts.expiresIn || '7d' });
}
export function verifyJwt(token) {
  try { return jwt.verify(token, JWT_SECRET); } catch(e) { return null; }
}
export async function hashPassword(p) {
  return await bcrypt.hash(p, 10);
}
export async function comparePassword(p, h) {
  return await bcrypt.compare(p, h);
}
