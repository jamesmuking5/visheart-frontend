import axios from "axios";

// Create a pre-configured instance of axios.
// This is a best practice for managing API calls in a structured way.
if (!process.env.NEXT_PUBLIC_API_URL) {
  console.error(
    "NEXT_PUBLIC_API_URL is not defined in your environment variables.",
  );
  throw new Error("Missing NEXT_PUBLIC_API_URL environment variable");
}

const api = axios.create({
  // Set the base URL for all API requests from your environment variables.
  // This makes it easy to switch between development and production environments.
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  // Crucially, this tells axios to send cookies (like the session ID) with every request.
  // This is essential for session-based authentication with Passport.js.
  withCredentials: true,
  timeout: 30000,
});

// Log the API base URL to the console for debugging purposes.
console.log(`API base URL: ${process.env.NEXT_PUBLIC_API_URL}`);

// Authentication functions
export const authApi = {
  /**
   * Register a new user account
   * @param userData - User registration data containing username, password, email, and phone
   * @returns Promise<ApiResponse> - Registration response with success status and user data
   */
  register: async (userData: {
    username: string;
    password: string;
    email: string;
    phone: string;
  }) => {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      // Rethrow the error for handling by the caller
      throw error;
    }
  },

  /**
   * Upgrade a guest account to a full registered user account
   * @param userData - User registration data containing username, password, email, and phone
   * @returns Promise<ApiResponse> - Registration response with success status and user data
   * @requires User must be authenticated as a guest user
   */
  registerFromGuest: async (userData: {
    username: string;
    password: string;
    email: string;
    phone: string;
  }) => {
    try {
      const response = await api.post("/auth/register-from-guest", userData);
      return response.data;
    } catch (error) {
      // Rethrow the error for handling by the caller
      throw error;
    }
  },

  // Login function that takes username and password
  login: async (username: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { username, password });
      return response.data;
    } catch (error) {
      // Rethrow the error for handling by the caller
      throw error;
    }
  },

  // Guest login function (doesn't need credentials)
  guestLogin: async () => {
    try {
      const response = await api.post("/auth/guest");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout function
  logout: async () => {
    try {
      const response = await api.post("/auth/logout");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get current user information
  fetchUser: async () => {
    try {
      const response = await api.get("/auth/fetch");
      return response.data;
    } catch (error: any) {
      // If user is not authenticated (401/403), this is expected behavior when not logged in
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Don't log this as it's expected behavior for unauthenticated users
        return { fetch: false, user: null };
      }
      // For other errors (network issues, server errors), still throw
      throw error;
    }
  },

  // Update user information
  updateUser: async (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }) => {
    try {
      const response = await api.post("/auth/update", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user password
  updatePassword: async (data: {
    currentPassword?: string;
    newPassword?: string;
  }) => {
    try {
      // Map frontend field names to backend field names
      const requestData = {
        old_password: data.currentPassword,
        password: data.newPassword,
      };
      const response = await api.post("/auth/update-password", requestData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete user account
  deleteUser: async () => {
    try {
      const response = await api.post("/auth/delete");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Project management functions
export const projectApi = {
  // Get all projects for the current user
  getProjects: async () => {
    try {
      const response = await api.get("/project/get-projects-list");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get specific project info
  getProjectInfo: async (projectId: string) => {
    try {
      const response = await api.get(`/project/get-project-info/${projectId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload new project
  uploadProject: async (formData: FormData) => {
    try {
      const response = await api.put("/project/upload-new-project", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update project details
  updateProject: async (
    projectId: string,
    name?: string,
    description?: string,
  ) => {
    try {
      const response = await api.patch("/project/update-project", {
        projectId,
        name,
        description,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Save/unsave project
  saveProject: async (projectId: string, isSaved: boolean) => {
    try {
      const response = await api.patch("/project/save-project", {
        projectId,
        isSaved,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete project
  deleteProject: async (projectId: string) => {
    try {
      const response = await api.delete(
        `/project/user-delete-project/${projectId}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get presigned URL for project tar file
  getProjectPresignedUrl: async (projectId: string) => {
    try {
      const response = await api.get("/project/get-project-presigned-url", {
        params: { projectId },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Segmentation functions
export const segmentationApi = {
  // Start segmentation for a project
  startSegmentation: async (projectId: string) => {
    try {
      const response = await api.post(
        `/segmentation/start-segmentation/${projectId}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get segmentation results for a project
  getSegmentationResults: async (projectId: string) => {
    try {
      const response = await api.get(
        `/segmentation/segmentation-results/${projectId}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Batch get segmentation status for multiple projects
  batchSegmentationStatus: async (projectIds: string[]) => {
    console.log('[API] Batch segmentation status check:', { projectIds });

    try {
      const response = await api.post('/segmentation/batch-segmentation-status', {
        projectIds,
      });

      console.log('[API] Batch segmentation status response:', {
        success: response.data.success,
        statusCount: Object.keys(response.data.statuses || {}).length
      });

      return response.data;
    } catch (error) {
      console.error('[API] Batch segmentation status error:', error);
      throw error;
    }
  },

  // Start manual segmentation
  startManualSegmentation: async (
    projectId: string,
    data: {
      image_name: string;
      bbox: number[];
      segmentationName?: string;
      segmentationDescription?: string;
    },
  ) => {
    try {
      const response = await api.post(
        `/segmentation/start-manual-segmentation/${projectId}`,
        data,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Save manual segmentation
  saveManualSegmentation: async (
    projectId: string,
    data: {
      name?: string;
      description?: string;
      frames?: any[];
    },
  ) => {
    try {
      const response = await api.put(
        `/segmentation/save-manual-segmentation/${projectId}`,
        data,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Save AI segmentation
  saveAISegmentation: async (segmentationMaskId: string) => {
    try {
      const response = await api.patch("/segmentation/save-ai-segmentation", {
        segmentationMaskId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user job status
  getUserJobs: async () => {
    try {
      const response = await api.get("/segmentation/user-check-jobs");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Export project data
  exportProjectData: async (projectId: string) => {
    try {
      console.log(`[API] Starting export for project: ${projectId}`);

      // First, get the presigned URL from the backend
      const response = await api.get(
        `/segmentation/export-project-data/${projectId}`,
      );

      console.log(`[API] Backend response:`, response.data);

      if (!response.data.success || !response.data.exportPackageUrl) {
        throw new Error(response.data.message || "Export failed - no download URL received");
      }

      // Then download the actual file from the presigned URL
      console.log(`[API] Downloading from presigned URL: ${response.data.exportPackageUrl}`);
      const fileResponse = await fetch(response.data.exportPackageUrl);

      console.log(`[API] File response:`, {
        status: fileResponse.status,
        statusText: fileResponse.statusText,
        headers: Object.fromEntries(fileResponse.headers.entries()),
        ok: fileResponse.ok
      });

      if (!fileResponse.ok) {
        throw new Error(`Failed to download export file: ${fileResponse.status} ${fileResponse.statusText}`);
      }

      const blob = await fileResponse.blob();
      console.log(`[API] Created blob:`, {
        size: blob.size,
        type: blob.type,
        expectedSize: response.data.fileSizeBytes
      });

      // Return both the blob and metadata
      return {
        blob,
        suggestedFilename: response.data.suggestedFilename || `project-${projectId}-export.nii.gz`,
        fileSizeBytes: response.data.fileSizeBytes
      };
    } catch (error) {
      console.error(`[API] Export error:`, error);
      throw error;
    }
  },
};

// Define interfaces for the admin-specific responses
export interface Project {
  _id: string;
  name: string;
  description: string;
  // Add other project fields as necessary
}

export interface UserWithProjects {
  userId: string;
  username: string;
  projectCount: number;
  projects: Project[];
}

export interface GetAllUsersWithProjectsResponse {
  fetch: boolean;
  totalUsers: number;
  data: UserWithProjects[];
}

// Admin functions
export const adminApi = {
  // Get all users with projects (admin only)
  getAllUsersWithProjects:
    async (): Promise<GetAllUsersWithProjectsResponse> => {
      try {
        const response = await api.get("/project/get-allusers-with-projects");
        console.log("Fetched users with projects:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching users with projects:", error);
        throw error;
      }
    },

  // Get all jobs status (admin only)
  getAllJobsStatus: async (page: number = 1, limit: number = 50) => {
    try {
      const response = await api.get(
        `/segmentation/admin-check-all-jobs-status?page=${page}&limit=${limit}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user role (admin only)
  updateUserRole: async (username: string, newRole: string) => {
    try {
      const response = await api.post("/auth/update-role", {
        username,
        newrole: newRole,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin route to update any user's information
  adminUpdateUser: async (targetUsername: string, updates: any) => {
    try {
      const response = await api.post("/auth/admin-update-user", {
        targetUsername,
        updates,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin-only route to delete a user by username
  adminDeleteUser: async (usernameToDelete: string) => {
    try {
      const response = await api.post("/auth/admin-delete-user", {
        usernameToDelete,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all users (admin only)
  getAllUsers: async () => {
    try {
      // This endpoint is now GET /auth/users as per the new routes
      const response = await api.get("/auth/users");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// System status functions
export const statusApi = {
  // Get GPU status
  getGpuStatus: async () => {
    try {
      const response = await api.get("/status/gpu-status");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get GPU system status (CPU, RAM, Disk)
  getGpuSystemStatus: async () => {
    try {
      const response = await api.get("/status/gpu-system-status");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// GPU configuration functions (admin only)
export const gpuConfigApi = {
  // Get current GPU configuration
  getGpuConfig: async () => {
    try {
      const response = await api.get("/admintools/gpu-config");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update GPU configuration
  updateGpuConfig: async (config: {
    host?: string;
    port?: number;
    isHTTPS?: boolean;
    description?: string;
    serverIdForGpuServer?: string;
    gpuServerIdentity?: string;
    gpuServerAuthJwtSecret?: string;
    jwtRefreshInterval?: number;
    jwtLifetimeSeconds?: number;
  }) => {
    try {
      const response = await api.patch("/admintools/gpu-config", config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reload GPU configuration from database
  reloadGpuConfig: async () => {
    try {
      const response = await api.post("/admintools/gpu-config/reload");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Test GPU server connection
  testGpuConnection: async () => {
    try {
      const response = await api.post("/admintools/gpu-config/test-connection");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Sample NIfTI files API
export const sampleNiftiApi = {
  /**
   * Get information about all available sample NIfTI files
   * @returns Promise<SampleNiftiResponse> - Response containing file information
   */
  getFileInfo: async () => {
    try {
      const response = await api.get("/sample-nifti/info");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get metadata for a specific NIfTI file
   * @param filename - Name of the NIfTI file
   * @returns Promise<ApiResponse> - Response containing file metadata
   */
  getFileMetadata: async (filename: string) => {
    try {
      const response = await api.get(`/sample-nifti/metadata/${filename}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Download a specific NIfTI file
   * @param filename - Name of the NIfTI file to download
   * @returns Promise<Blob> - File blob for download
   */
  downloadFile: async (filename: string): Promise<Blob> => {
    try {
      const response = await api.get(`/sample-nifti/download/${filename}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api;
