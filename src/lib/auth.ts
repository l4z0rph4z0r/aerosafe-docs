// Secure Authentication System for AeroSafe Documentation
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Use environment variables with secure defaults
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || crypto.randomUUID();
const TOKEN_EXPIRY = process.env.ADMIN_TOKEN_EXPIRY || '8h';
const ADMIN_USERNAME = process.env.REACT_APP_ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2a$10$YourHashedPasswordHere';

export interface AuthUser {
  username: string;
  role: 'admin' | 'editor' | 'viewer';
  loginTime: number;
}

export interface AuthToken {
  token: string;
  expiresAt: number;
  user: AuthUser;
}

export class AuthService {
  private static instance: AuthService;
  
  private constructor() {}
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async validateCredentials(username: string, password: string): Promise<boolean> {
    if (username !== ADMIN_USERNAME) {
      return false;
    }
    
    // In production, compare against hashed password from environment
    if (process.env.NODE_ENV === 'production') {
      return await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    }
    
    // Development fallback (should be removed in production)
    return password === (process.env.REACT_APP_ADMIN_PASSWORD || 'AeroSafe2024#Secure!');
  }

  generateToken(user: AuthUser): AuthToken {
    const expiresIn = this.parseExpiry(TOKEN_EXPIRY);
    const token = jwt.sign(
      { 
        username: user.username,
        role: user.role,
        loginTime: user.loginTime 
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    
    return {
      token,
      expiresAt: Date.now() + expiresIn,
      user
    };
  }

  verifyToken(token: string): AuthUser | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
      return decoded;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) return true;
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  }

  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 8 * 60 * 60 * 1000; // Default 8 hours
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 8 * 60 * 60 * 1000;
    }
  }

  // Session management
  saveSession(authToken: AuthToken): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('aerosafe_auth_token', authToken.token);
      sessionStorage.setItem('aerosafe_auth_expires', authToken.expiresAt.toString());
      sessionStorage.setItem('aerosafe_auth_user', JSON.stringify(authToken.user));
    }
  }

  getSession(): AuthToken | null {
    if (typeof window === 'undefined') return null;
    
    const token = sessionStorage.getItem('aerosafe_auth_token');
    const expiresAt = sessionStorage.getItem('aerosafe_auth_expires');
    const userStr = sessionStorage.getItem('aerosafe_auth_user');
    
    if (!token || !expiresAt || !userStr) return null;
    
    const user = JSON.parse(userStr) as AuthUser;
    const expiry = parseInt(expiresAt);
    
    if (Date.now() >= expiry) {
      this.clearSession();
      return null;
    }
    
    return { token, expiresAt: expiry, user };
  }

  clearSession(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('aerosafe_auth_token');
      sessionStorage.removeItem('aerosafe_auth_expires');
      sessionStorage.removeItem('aerosafe_auth_user');
    }
  }

  // CSRF Protection
  generateCSRFToken(): string {
    const token = crypto.randomUUID();
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('aerosafe_csrf_token', token);
    }
    return token;
  }

  validateCSRFToken(token: string): boolean {
    if (typeof window === 'undefined') return false;
    const storedToken = sessionStorage.getItem('aerosafe_csrf_token');
    return storedToken === token;
  }
}

export const authService = AuthService.getInstance();