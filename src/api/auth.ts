// Backend authentication API
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'ae5f2d8b9c3e1a7d4f6b2c8e9a3f5d7b1e4c6a8d2f9b3e7c1a5d8f2b4e7c9a1d';
const TOKEN_EXPIRY = process.env.ADMIN_TOKEN_EXPIRY || '8h';

interface LoginAttempt {
  count: number;
  lastAttempt: number;
  lockedUntil?: number;
}

// In-memory store for login attempts (in production, use Redis or database)
const loginAttempts = new Map<string, LoginAttempt>();

// Secure password hashing
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + JWT_SECRET).digest('hex');
}

// Verify password
function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Generate JWT token
function generateToken(username: string, role: string = 'admin'): string {
  return jwt.sign(
    { username, role, iat: Date.now() },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

// Verify JWT token
export function verifyToken(token: string): { username: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { username: decoded.username, role: decoded.role };
  } catch (error) {
    return null;
  }
}

// Check login attempts
function checkLoginAttempts(identifier: string): boolean {
  const attempts = loginAttempts.get(identifier);
  
  if (!attempts) {
    return true;
  }
  
  // Check if account is locked
  if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
    return false;
  }
  
  // Reset if lockout period has passed
  if (attempts.lockedUntil && Date.now() >= attempts.lockedUntil) {
    loginAttempts.delete(identifier);
    return true;
  }
  
  return attempts.count < 5;
}

// Record login attempt
function recordLoginAttempt(identifier: string, success: boolean): void {
  if (success) {
    loginAttempts.delete(identifier);
    return;
  }
  
  const attempts = loginAttempts.get(identifier) || { count: 0, lastAttempt: Date.now() };
  attempts.count += 1;
  attempts.lastAttempt = Date.now();
  
  // Lock account after 5 failed attempts for 15 minutes
  if (attempts.count >= 5) {
    attempts.lockedUntil = Date.now() + (15 * 60 * 1000);
  }
  
  loginAttempts.set(identifier, attempts);
}

// Login handler
export async function handleLogin(username: string, password: string, ipAddress: string): Promise<{ success: boolean; token?: string; error?: string }> {
  const identifier = `${username}:${ipAddress}`;
  
  // Check if account is locked
  if (!checkLoginAttempts(identifier)) {
    return { 
      success: false, 
      error: 'Account temporarily locked due to multiple failed attempts. Please try again later.' 
    };
  }
  
  // Get credentials from environment
  const validUsername = process.env.REACT_APP_ADMIN_USERNAME || 'admin';
  const validPassword = process.env.REACT_APP_ADMIN_PASSWORD || 'AeroSafe2024#Secure!';
  
  // Verify credentials
  if (username !== validUsername || password !== validPassword) {
    recordLoginAttempt(identifier, false);
    return { 
      success: false, 
      error: 'Invalid username or password' 
    };
  }
  
  // Generate token
  const token = generateToken(username);
  recordLoginAttempt(identifier, true);
  
  return { 
    success: true, 
    token 
  };
}

// Session validation
export function validateSession(token: string): boolean {
  return verifyToken(token) !== null;
}

// Logout handler (optional - for session tracking)
export function handleLogout(token: string): void {
  // In production, you might want to blacklist the token
  // or track active sessions in a database
}

export default {
  handleLogin,
  verifyToken,
  validateSession,
  handleLogout
};