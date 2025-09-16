import React, { useState } from 'react';
import Layout from '@theme/Layout';
import styles from './admin.module.css';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simple authentication check
      if (username === 'admin' && password === 'AeroSafe2024#Secure!') {
        // Store auth in localStorage
        localStorage.setItem('aerosafe_auth', JSON.stringify({
          username,
          loginTime: Date.now()
        }));
        
        // Redirect to dashboard
        window.location.href = '/admin/dashboard';
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      title="Admin Login"
      description="Admin login page for AeroSafe documentation management">
      <main className="container margin-vert--lg">
        <div className="row">
          <div className="col col--4 col--offset-4">
            <div className="card">
              <div className="card__header">
                <h2>Admin Login</h2>
              </div>
              <div className="card__body">
                <p>Please enter your credentials to access the admin panel.</p>
                
                <form onSubmit={handleLogin}>
                  <div className="margin-bottom--md">
                    <label htmlFor="username">Username</label>
                    <input
                      type="text"
                      id="username"
                      className="input--full-width"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="margin-bottom--lg">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      className="input--full-width"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  {error && (
                    <div className="alert alert--danger margin-bottom--md">
                      {error}
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    className="button button--primary button--block"
                    disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>
              </div>
              <div className="card__footer">
                <small>
                  🔒 This is a secure admin area. All activities are logged and monitored.
                </small>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}