// Client-side authentication utilities (no Node.js dependencies)
import Cookies from 'js-cookie';

const AUTH_COOKIE_NAME = 'aerosafe_admin_auth';
const AUTH_EXPIRY_HOURS = 8;

export interface AuthUser {
  username: string;
  role: string;
  loginTime: number;
}

export class AuthClient {
  private static instance: AuthClient;

  private constructor() {}

  public static getInstance(): AuthClient {
    if (!AuthClient.instance) {
      AuthClient.instance = new AuthClient();
    }
    return AuthClient.instance;
  }

  /**
   * Client-side login validation
   * In production, this should call a secure API endpoint
   */
  public async login(username: string, password: string): Promise<boolean> {
    try {
      // Environment-based credentials for better security
      const envUsername = process.env.REACT_APP_ADMIN_USERNAME || 'admin';
      const envPassword = process.env.REACT_APP_ADMIN_PASSWORD || 'AeroSafe2024#Secure!';
      
      const validCredentials = 
        username === envUsername && password === envPassword;

      if (validCredentials) {
        const authData: AuthUser = {
          username,
          role: 'admin',
          loginTime: Date.now()
        };

        // Store auth data in cookie with secure flags
        Cookies.set(AUTH_COOKIE_NAME, JSON.stringify(authData), {
          expires: AUTH_EXPIRY_HOURS / 24,
          sameSite: 'strict',
          secure: window.location.protocol === 'https:',
          path: '/'
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  /**
   * Logout user
   */
  public logout(): void {
    Cookies.remove(AUTH_COOKIE_NAME);
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    try {
      const authCookie = Cookies.get(AUTH_COOKIE_NAME);
      if (!authCookie) return false;

      const authData: AuthUser = JSON.parse(authCookie);
      
      // Check if session is expired (8 hours)
      const expiryTime = authData.loginTime + (AUTH_EXPIRY_HOURS * 60 * 60 * 1000);
      if (Date.now() > expiryTime) {
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  }

  /**
   * Get current user
   */
  public getCurrentUser(): AuthUser | null {
    try {
      const authCookie = Cookies.get(AUTH_COOKIE_NAME);
      if (!authCookie) return null;

      return JSON.parse(authCookie);
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  /**
   * Protect a route (redirect to login if not authenticated)
   */
  public protectRoute(): void {
    if (typeof window !== 'undefined' && !this.isAuthenticated()) {
      window.location.href = '/admin/login';
    }
  }

  /**
   * Verify token and return user if valid
   */
  public async verifyToken(): Promise<AuthUser | null> {
    try {
      if (!this.isAuthenticated()) {
        return null;
      }
      return this.getCurrentUser();
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  /**
   * Validate session is still active
   */
  public async validateSession(): Promise<boolean> {
    return this.isAuthenticated();
  }
}

// Export singleton instance
export const authClient = AuthClient.getInstance();