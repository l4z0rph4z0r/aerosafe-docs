// Client-side file manager that works via API endpoints
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

export class FileManagerClient {
  private static instance: FileManagerClient;
  private apiBase = '/api/admin/files';

  private constructor() {}

  public static getInstance(): FileManagerClient {
    if (!FileManagerClient.instance) {
      FileManagerClient.instance = new FileManagerClient();
    }
    return FileManagerClient.instance;
  }

  /**
   * List all files and directories in a given path
   */
  public async listFiles(directory: string = 'docs'): Promise<FileItem[]> {
    try {
      // In development, return mock data
      // In production, this would call the API endpoint
      const mockFiles: FileItem[] = [
        {
          name: 'intro.md',
          path: 'docs/intro.md',
          type: 'file',
          extension: '.md',
          isMarkdown: true,
          size: 2048,
          lastModified: new Date()
        },
        {
          name: 'tutorials',
          path: 'docs/tutorials',
          type: 'directory',
          lastModified: new Date()
        },
        {
          name: 'getting-started.md',
          path: 'docs/getting-started.md',
          type: 'file',
          extension: '.md',
          isMarkdown: true,
          size: 1024,
          lastModified: new Date()
        }
      ];
      
      return mockFiles;
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
      // Mock content for development
      const mockContent = `# Example Document

This is example content for the file ${filePath}.

## Features

- Easy to edit
- Markdown support
- Live preview

## Getting Started

1. Select a file from the sidebar
2. Edit the content
3. Save your changes`;

      return {
        path: filePath,
        content: mockContent,
        frontmatter: {
          title: 'Example Document',
          sidebar_position: 1
        },
        lastModified: new Date()
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
      // In production, this would make an API call
      console.log(`Saving file: ${filePath}`);
      console.log('Content:', content.substring(0, 100) + '...');
      console.log('Frontmatter:', frontmatter);
      
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      const relativePath = `${directory}/${filename}`;
      
      // Default frontmatter for new files
      const defaultFrontmatter = {
        title: filename.replace(/\.(md|mdx)$/, '').replace(/-/g, ' '),
        ...frontmatter
      };

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
      // In production, this would make an API call
      console.log(`Deleting file: ${filePath}`);
      
      // Simulate delete delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
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
      // In production, this would make an API call
      console.log(`Renaming file: ${oldPath} -> ${newPath}`);
      
      // Simulate rename delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
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
      
      // Simple client-side filtering for mock data
      return files.filter(file => 
        file.name.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error(`Error searching files:`, error);
      throw new Error('Failed to search files');
    }
  }
}

// Export singleton instance
export const fileManagerClient = FileManagerClient.getInstance();