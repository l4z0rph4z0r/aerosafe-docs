import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Editor from '@monaco-editor/react';
import styles from './admin.module.css';

interface Document {
  path: string;
  name: string;
  frontMatter: any;
  lastModified: string;
  type: 'doc' | 'blog';
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [docContent, setDocContent] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem('aerosafe_auth');
    if (auth) {
      const authData = JSON.parse(auth);
      // Check if session is still valid (8 hours)
      if (Date.now() - authData.loginTime < 8 * 60 * 60 * 1000) {
        setIsAuthenticated(true);
        setUser(authData);
        setLoading(false);
        loadDocuments();
      } else {
        // Session expired
        localStorage.removeItem('aerosafe_auth');
        window.location.href = '/admin/login';
      }
    } else {
      // Not authenticated
      window.location.href = '/admin/login';
    }
  }, []);

  const loadDocuments = async () => {
    try {
      // For now, use sample data - in production this would fetch from API
      const sampleDocs: Document[] = [
        {
          path: '/docs/getting-started.md',
          name: 'Getting Started',
          frontMatter: { title: 'Getting Started', sidebar_position: 1 },
          lastModified: new Date().toISOString(),
          type: 'doc'
        },
        {
          path: '/docs/products/dfs-1.md',
          name: 'DFS-1 Nebulizer',
          frontMatter: { title: 'DFS-1 Nebulizer', sidebar_position: 2 },
          lastModified: new Date().toISOString(),
          type: 'doc'
        },
        {
          path: '/blog/welcome.md',
          name: 'Welcome to AeroSafe',
          frontMatter: { title: 'Welcome', date: '2024-01-01' },
          lastModified: new Date().toISOString(),
          type: 'blog'
        }
      ];
      setDocuments(sampleDocs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const handleDocumentSelect = async (doc: Document) => {
    setSelectedDoc(doc);
    // Load document content - in production from API
    const sampleContent = `---
title: ${doc.frontMatter.title}
sidebar_position: ${doc.frontMatter.sidebar_position || 999}
---

# ${doc.name}

This is sample content for ${doc.name}.

## Features

- Feature 1
- Feature 2
- Feature 3

## Usage

\`\`\`javascript
// Example code
console.log('Hello AeroSafe!');
\`\`\`
`;
    setDocContent(sampleContent);
    setEditMode(false);
  };

  const handleSave = async () => {
    if (!selectedDoc || !docContent) return;
    
    setSaving(true);
    try {
      // In production, save via API
      console.log('Saving document:', selectedDoc.path);
      console.log('Content:', docContent);
      
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Document saved successfully!');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aerosafe_auth');
    window.location.href = '/admin/login';
  };

  if (loading) {
    return (
      <Layout title="Admin Dashboard">
        <main className="container margin-vert--lg">
          <div className="text--center">Loading...</div>
        </main>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout
      title="Admin Dashboard"
      description="Admin dashboard for AeroSafe documentation management">
      <main className="container margin-vert--lg">
        <div className="row margin-bottom--lg">
          <div className="col">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1>Admin Dashboard</h1>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span>Welcome, <strong>{user?.username}</strong></span>
                <button
                  onClick={handleLogout}
                  className="button button--danger button--sm">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col col--4">
            <div className="card">
              <div className="card__header">
                <h3>📚 Documentation Management</h3>
              </div>
              <div className="card__body">
                <p>Manage your documentation files</p>
                <ul>
                  <li><Link to="/docs">View Documentation</Link></li>
                  <li>Edit existing pages (coming soon)</li>
                  <li>Create new pages (coming soon)</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="col col--4">
            <div className="card">
              <div className="card__header">
                <h3>📝 Blog Management</h3>
              </div>
              <div className="card__body">
                <p>Manage blog posts and news</p>
                <ul>
                  <li><Link to="/blog">View Blog</Link></li>
                  <li>Create new posts (coming soon)</li>
                  <li>Edit existing posts (coming soon)</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="col col--4">
            <div className="card">
              <div className="card__header">
                <h3>⚙️ Settings</h3>
              </div>
              <div className="card__body">
                <p>System configuration</p>
                <ul>
                  <li>User: {user?.username}</li>
                  <li>Role: Admin</li>
                  <li>Session: Active</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="row margin-top--lg">
          <div className="col">
            <div className="alert alert--warning">
              <h3>🔒 Security Info</h3>
              <ul>
                <li>Sessions expire after 8 hours</li>
                <li>All actions are logged</li>
                <li>Files are backed up automatically</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="row margin-top--lg">
          <div className="col col--4">
            <div className="card">
              <div className="card__header">
                <h3>📄 Documents</h3>
              </div>
              <div className="card__body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {documents.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {documents.map(doc => (
                      <li key={doc.path} style={{ marginBottom: '0.5rem' }}>
                        <button
                          className="button button--link button--block"
                          style={{ textAlign: 'left', padding: '0.5rem' }}
                          onClick={() => handleDocumentSelect(doc)}>
                          <strong>{doc.type === 'blog' ? '📝' : '📚'} {doc.name}</strong>
                          <br/>
                          <small>{doc.path}</small>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Loading documents...</p>
                )}
              </div>
            </div>
          </div>
          <div className="col col--8">
            <div className="card">
              <div className="card__header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>✏️ Editor {selectedDoc && `- ${selectedDoc.name}`}</h3>
                  {selectedDoc && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="button button--sm button--secondary"
                        onClick={() => setEditMode(!editMode)}>
                        {editMode ? 'Preview' : 'Edit'}
                      </button>
                      <button
                        className="button button--sm button--primary"
                        onClick={handleSave}
                        disabled={saving || !editMode}>
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="card__body" style={{ padding: 0 }}>
                {selectedDoc ? (
                  editMode ? (
                    <Editor
                      height="400px"
                      defaultLanguage="markdown"
                      value={docContent}
                      onChange={(value) => setDocContent(value || '')}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: 'on'
                      }}
                    />
                  ) : (
                    <div style={{ padding: '1rem', height: '400px', overflowY: 'auto' }}>
                      <pre style={{ whiteSpace: 'pre-wrap' }}>{docContent}</pre>
                    </div>
                  )
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <p>Select a document to edit</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}