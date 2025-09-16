import React, { useState, useEffect } from 'react';
import { authClient as authService, type AuthUser as AdminUser } from '../../utils/authClient';
import { fileManagerClient, type FileItem } from '../../utils/fileManagerClient';
import AdminMarkdownEditor from './AdminMarkdownEditor';
import './AdminDashboard.css';

interface AdminDashboardProps {
  user?: AdminUser;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user: propUser }) => {
  const [user, setUser] = useState<AdminUser | null>(propUser || null);
  const [loading, setLoading] = useState(!propUser);
  const [currentView, setCurrentView] = useState<'files' | 'editor' | 'settings'>('files');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentDirectory, setCurrentDirectory] = useState<'docs' | 'blog'>('docs');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FileItem[]>([]);
  const [error, setError] = useState('');

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticatedUser = authService.getCurrentUser();
        if (!authenticatedUser || !authService.isAuthenticated()) {
          window.location.href = '/admin/login';
          return;
        }
        setUser(authenticatedUser);
      } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/admin/login';
      } finally {
        setLoading(false);
      }
    };

    if (!propUser) {
      checkAuth();
    }
  }, [propUser]);

  // Load files
  useEffect(() => {
    loadFiles();
  }, [currentDirectory]);

  // Session validation
  useEffect(() => {
    const interval = setInterval(() => {
      const isValid = authService.isAuthenticated();
      if (!isValid) {
        handleLogout();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const loadFiles = async () => {
    try {
      const fileList = await fileManagerClient.listFiles(currentDirectory);
      setFiles(fileList);
      setError('');
    } catch (error) {
      console.error('Failed to load files:', error);
      setError('Failed to load files. Please try again.');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await fileManagerClient.searchFiles(searchQuery, currentDirectory);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setError('Search failed. Please try again.');
    }
  };

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
    setCurrentView('editor');
  };

  const handleFileCreated = (filePath: string) => {
    loadFiles();
    setSelectedFile(filePath);
    setCurrentView('editor');
  };

  const handleFileDeleted = () => {
    loadFiles();
    setSelectedFile(null);
    setCurrentView('files');
  };

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/admin/login';
  };

  const createNewFile = async () => {
    const filename = prompt('Enter filename (e.g., new-document.md):');
    if (!filename) return;

    if (!filename.endsWith('.md') && !filename.endsWith('.mdx')) {
      setError('Filename must end with .md or .mdx');
      return;
    }

    try {
      const newFilePath = await fileManagerClient.createFile(currentDirectory, filename);
      handleFileCreated(newFilePath);
      setError('');
    } catch (error) {
      console.error('Failed to create file:', error);
      setError(`Failed to create file: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="admin-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-dashboard-error">
        <p>Authentication required. Redirecting to login...</p>
      </div>
    );
  }

  const displayFiles = searchQuery.trim() ? searchResults : files;

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard-header">
        <div className="admin-header-left">
          <img 
            src="/img/IST-srl_logo.png" 
            alt="AeroSafe" 
            className="admin-header-logo"
          />
          <h1>AeroSafe Admin Panel</h1>
        </div>
        <div className="admin-header-right">
          <span className="admin-user-info">
            Welcome, <strong>{user.username}</strong>
          </span>
          <button 
            onClick={handleLogout}
            className="admin-logout-button"
            title="Sign out"
          >
            Sign Out
          </button>
        </div>
      </header>

      <nav className="admin-dashboard-nav">
        <button
          className={`admin-nav-item ${currentView === 'files' ? 'active' : ''}`}
          onClick={() => setCurrentView('files')}
        >
          📁 File Manager
        </button>
        <button
          className={`admin-nav-item ${currentView === 'editor' ? 'active' : ''}`}
          onClick={() => setCurrentView('editor')}
          disabled={!selectedFile}
        >
          ✏️ Editor
        </button>
        <button
          className={`admin-nav-item ${currentView === 'settings' ? 'active' : ''}`}
          onClick={() => setCurrentView('settings')}
        >
          ⚙️ Settings
        </button>
      </nav>

      <main className="admin-dashboard-main">
        {error && (
          <div className="admin-error-banner" role="alert">
            <span className="admin-error-icon">⚠️</span>
            {error}
            <button 
              onClick={() => setError('')}
              className="admin-error-close"
              aria-label="Close error message"
            >
              ×
            </button>
          </div>
        )}

        {currentView === 'files' && (
          <div className="admin-file-manager">
            <div className="admin-file-manager-toolbar">
              <div className="admin-toolbar-left">
                <div className="admin-directory-switcher">
                  <button
                    className={`admin-dir-button ${currentDirectory === 'docs' ? 'active' : ''}`}
                    onClick={() => setCurrentDirectory('docs')}
                  >
                    📚 Documentation
                  </button>
                  <button
                    className={`admin-dir-button ${currentDirectory === 'blog' ? 'active' : ''}`}
                    onClick={() => setCurrentDirectory('blog')}
                  >
                    📝 Blog Posts
                  </button>
                </div>
              </div>
              
              <div className="admin-toolbar-center">
                <div className="admin-search-container">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search files..."
                    className="admin-search-input"
                  />
                  <button 
                    onClick={handleSearch}
                    className="admin-search-button"
                  >
                    🔍
                  </button>
                </div>
              </div>

              <div className="admin-toolbar-right">
                <button 
                  onClick={createNewFile}
                  className="admin-new-file-button"
                  title="Create new file"
                >
                  + New File
                </button>
                <button 
                  onClick={loadFiles}
                  className="admin-refresh-button"
                  title="Refresh file list"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>

            <div className="admin-file-list">
              {displayFiles.length === 0 ? (
                <div className="admin-file-list-empty">
                  {searchQuery.trim() ? 
                    'No files found matching your search.' : 
                    'No files found in this directory.'}
                </div>
              ) : (
                displayFiles.map((file) => (
                  <div
                    key={file.path}
                    className={`admin-file-item ${file.type}`}
                    onClick={() => file.isMarkdown && handleFileSelect(file.path)}
                    style={{ cursor: file.isMarkdown ? 'pointer' : 'default' }}
                  >
                    <div className="admin-file-icon">
                      {file.type === 'directory' ? '📁' : 
                       file.isMarkdown ? '📝' : '📄'}
                    </div>
                    <div className="admin-file-details">
                      <div className="admin-file-name">
                        {file.name}
                        {!file.isMarkdown && file.type === 'file' && (
                          <span className="admin-file-readonly">(read-only)</span>
                        )}
                      </div>
                      <div className="admin-file-meta">
                        {file.size && `${(file.size / 1024).toFixed(1)} KB`}
                        {file.lastModified && ` • ${file.lastModified.toLocaleDateString()}`}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {currentView === 'editor' && selectedFile && (
          <AdminMarkdownEditor
            filePath={selectedFile}
            onSave={loadFiles}
            onDelete={handleFileDeleted}
            onError={setError}
          />
        )}

        {currentView === 'settings' && (
          <div className="admin-settings">
            <h2>Admin Settings</h2>
            <div className="admin-settings-content">
              <div className="admin-settings-section">
                <h3>Account Information</h3>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Session:</strong> Active</p>
              </div>
              
              <div className="admin-settings-section">
                <h3>Security</h3>
                <p>All administrative actions are logged and monitored.</p>
                <p>Sessions automatically expire after 8 hours of inactivity.</p>
                <p>Files are automatically backed up before editing.</p>
              </div>

              <div className="admin-settings-section">
                <h3>System Information</h3>
                <p><strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</p>
                <p><strong>Last Updated:</strong> {new Date().toLocaleString()}</p>
              </div>

              <div className="admin-settings-actions">
                <button 
                  onClick={handleLogout}
                  className="admin-settings-button danger"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;