import { promises as fs } from 'fs';
import path from 'path';

export interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  extension?: string;
  size?: number;
  lastModified?: Date;
  isMarkdown?: boolean;
}

export interface FileContent {
  path: string;
  content: string;
  frontmatter?: any;
  lastModified: Date;
}

export class FileManager {
  private static instance: FileManager;
  private docsPath: string;
  private blogPath: string;

  private constructor() {
    this.docsPath = path.join(process.cwd(), 'docs');
    this.blogPath = path.join(process.cwd(), 'blog');
  }

  public static getInstance(): FileManager {
    if (!FileManager.instance) {
      FileManager.instance = new FileManager();
    }
    return FileManager.instance;
  }

  /**
   * List all files and directories in a given path
   */
  public async listFiles(directory: string = 'docs'): Promise<FileItem[]> {
    try {
      const targetPath = directory === 'blog' ? this.blogPath : this.docsPath;
      const entries = await fs.readdir(targetPath, { withFileTypes: true });
      
      const files: FileItem[] = [];
      
      for (const entry of entries) {
        const fullPath = path.join(targetPath, entry.name);
        const stat = await fs.stat(fullPath);
        
        const fileItem: FileItem = {
          name: entry.name,
          path: path.relative(process.cwd(), fullPath),
          type: entry.isDirectory() ? 'directory' : 'file',
          size: stat.size,
          lastModified: stat.mtime
        };

        if (entry.isFile()) {
          const extension = path.extname(entry.name).toLowerCase();
          fileItem.extension = extension;
          fileItem.isMarkdown = extension === '.md' || extension === '.mdx';
        }

        files.push(fileItem);
      }

      // Sort: directories first, then files alphabetically
      return files.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error(`Error listing files in ${directory}:`, error);
      throw new Error(`Failed to list files in ${directory}`);
    }
  }

  /**
   * Get file content for editing
   */
  public async getFileContent(filePath: string): Promise<FileContent> {
    try {
      const fullPath = path.resolve(process.cwd(), filePath);
      
      // Security check: ensure file is within allowed directories
      if (!this.isPathAllowed(fullPath)) {
        throw new Error('Access denied: File path not allowed');
      }

      const content = await fs.readFile(fullPath, 'utf-8');
      const stat = await fs.stat(fullPath);

      // Parse frontmatter if it exists
      let frontmatter = null;
      let bodyContent = content;

      if (content.startsWith('---\n')) {
        const frontmatterEnd = content.indexOf('\n---\n', 4);
        if (frontmatterEnd !== -1) {
          try {
            const frontmatterText = content.slice(4, frontmatterEnd);
            frontmatter = this.parseFrontmatter(frontmatterText);
            bodyContent = content.slice(frontmatterEnd + 5);
          } catch (error) {
            console.warn('Failed to parse frontmatter:', error);
          }
        }
      }

      return {
        path: filePath,
        content: bodyContent,
        frontmatter,
        lastModified: stat.mtime
      };
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      throw new Error(`Failed to read file: ${filePath}`);
    }
  }

  /**
   * Save file content
   */
  public async saveFileContent(filePath: string, content: string, frontmatter?: any): Promise<void> {
    try {
      const fullPath = path.resolve(process.cwd(), filePath);
      
      // Security check: ensure file is within allowed directories
      if (!this.isPathAllowed(fullPath)) {
        throw new Error('Access denied: File path not allowed');
      }

      // Create backup before saving
      await this.createBackup(fullPath);

      let finalContent = content;

      // Add frontmatter if provided
      if (frontmatter && Object.keys(frontmatter).length > 0) {
        const frontmatterText = this.stringifyFrontmatter(frontmatter);
        finalContent = `---\n${frontmatterText}---\n\n${content}`;
      }

      // Ensure directory exists
      const dir = path.dirname(fullPath);
      await fs.mkdir(dir, { recursive: true });

      // Write file
      await fs.writeFile(fullPath, finalContent, 'utf-8');

      console.log(`File saved successfully: ${filePath}`);
    } catch (error) {
      console.error(`Error saving file ${filePath}:`, error);
      throw new Error(`Failed to save file: ${filePath}`);
    }
  }

  /**
   * Create a new file
   */
  public async createFile(directory: string, filename: string, content: string = '', frontmatter?: any): Promise<string> {
    try {
      const targetDir = directory === 'blog' ? this.blogPath : this.docsPath;
      const fullPath = path.join(targetDir, filename);

      // Check if file already exists
      try {
        await fs.access(fullPath);
        throw new Error('File already exists');
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }

      // Create default frontmatter for new files
      const defaultFrontmatter = {
        title: path.basename(filename, path.extname(filename)),
        ...frontmatter
      };

      const relativePath = path.relative(process.cwd(), fullPath);
      await this.saveFileContent(relativePath, content, defaultFrontmatter);

      return relativePath;
    } catch (error) {
      console.error(`Error creating file ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Delete a file
   */
  public async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.resolve(process.cwd(), filePath);
      
      // Security check: ensure file is within allowed directories
      if (!this.isPathAllowed(fullPath)) {
        throw new Error('Access denied: File path not allowed');
      }

      // Create backup before deletion
      await this.createBackup(fullPath);

      // Delete file
      await fs.unlink(fullPath);

      console.log(`File deleted successfully: ${filePath}`);
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
      throw new Error(`Failed to delete file: ${filePath}`);
    }
  }

  /**
   * Rename/move a file
   */
  public async renameFile(oldPath: string, newPath: string): Promise<void> {
    try {
      const fullOldPath = path.resolve(process.cwd(), oldPath);
      const fullNewPath = path.resolve(process.cwd(), newPath);
      
      // Security checks
      if (!this.isPathAllowed(fullOldPath) || !this.isPathAllowed(fullNewPath)) {
        throw new Error('Access denied: File path not allowed');
      }

      // Create backup before rename
      await this.createBackup(fullOldPath);

      // Ensure target directory exists
      const newDir = path.dirname(fullNewPath);
      await fs.mkdir(newDir, { recursive: true });

      // Rename file
      await fs.rename(fullOldPath, fullNewPath);

      console.log(`File renamed: ${oldPath} -> ${newPath}`);
    } catch (error) {
      console.error(`Error renaming file ${oldPath} to ${newPath}:`, error);
      throw new Error(`Failed to rename file: ${oldPath}`);
    }
  }

  /**
   * Search files by content
   */
  public async searchFiles(query: string, directory: string = 'docs'): Promise<FileItem[]> {
    try {
      const files = await this.listFiles(directory);
      const markdownFiles = files.filter(file => file.isMarkdown);
      const results: FileItem[] = [];

      for (const file of markdownFiles) {
        try {
          const content = await this.getFileContent(file.path);
          if (content.content.toLowerCase().includes(query.toLowerCase()) ||
              file.name.toLowerCase().includes(query.toLowerCase())) {
            results.push(file);
          }
        } catch (error) {
          console.warn(`Error searching in file ${file.path}:`, error);
        }
      }

      return results;
    } catch (error) {
      console.error(`Error searching files:`, error);
      throw new Error('Failed to search files');
    }
  }

  /**
   * Create a backup of a file
   */
  private async createBackup(filePath: string): Promise<void> {
    try {
      const backupDir = path.join(process.cwd(), '.admin_backups');
      await fs.mkdir(backupDir, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = path.basename(filePath);
      const backupPath = path.join(backupDir, `${fileName}.${timestamp}.backup`);

      await fs.copyFile(filePath, backupPath);

      // Clean old backups (keep only last 10 per file)
      await this.cleanOldBackups(backupDir, fileName);
    } catch (error) {
      console.warn(`Failed to create backup for ${filePath}:`, error);
      // Don't throw error - backup failure shouldn't prevent file operations
    }
  }

  /**
   * Clean old backup files
   */
  private async cleanOldBackups(backupDir: string, fileName: string): Promise<void> {
    try {
      const entries = await fs.readdir(backupDir);
      const backups = entries
        .filter(entry => entry.startsWith(fileName) && entry.endsWith('.backup'))
        .map(entry => ({
          name: entry,
          path: path.join(backupDir, entry),
          mtime: fs.stat(path.join(backupDir, entry)).then(stat => stat.mtime)
        }));

      // Sort by modification time (newest first)
      const sortedBackups = await Promise.all(backups.map(async b => ({
        ...b,
        mtime: await b.mtime
      })));

      sortedBackups.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

      // Remove old backups (keep only 10 most recent)
      if (sortedBackups.length > 10) {
        const toDelete = sortedBackups.slice(10);
        for (const backup of toDelete) {
          await fs.unlink(backup.path);
        }
      }
    } catch (error) {
      console.warn('Failed to clean old backups:', error);
    }
  }

  /**
   * Check if file path is within allowed directories
   */
  private isPathAllowed(fullPath: string): boolean {
    const normalizedPath = path.normalize(fullPath);
    const allowedPaths = [
      path.normalize(this.docsPath),
      path.normalize(this.blogPath)
    ];

    return allowedPaths.some(allowedPath => 
      normalizedPath.startsWith(allowedPath + path.sep) || normalizedPath === allowedPath
    );
  }

  /**
   * Parse frontmatter YAML
   */
  private parseFrontmatter(frontmatter: string): any {
    const lines = frontmatter.trim().split('\n');
    const result: any = {};

    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.slice(0, colonIndex).trim();
        const value = line.slice(colonIndex + 1).trim();
        
        // Basic type parsing
        if (value === 'true') result[key] = true;
        else if (value === 'false') result[key] = false;
        else if (/^\d+$/.test(value)) result[key] = parseInt(value);
        else if (/^\d+\.\d+$/.test(value)) result[key] = parseFloat(value);
        else if (value.startsWith('"') && value.endsWith('"')) {
          result[key] = value.slice(1, -1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          result[key] = value.slice(1, -1);
        } else {
          result[key] = value;
        }
      }
    }

    return result;
  }

  /**
   * Stringify frontmatter to YAML
   */
  private stringifyFrontmatter(frontmatter: any): string {
    const lines: string[] = [];
    
    for (const [key, value] of Object.entries(frontmatter)) {
      if (typeof value === 'string') {
        lines.push(`${key}: "${value}"`);
      } else {
        lines.push(`${key}: ${value}`);
      }
    }

    return lines.join('\n') + '\n';
  }
}

// Export singleton instance
export const fileManager = FileManager.getInstance();