import axios from "axios";

// Create a pre-configured instance of axios.
// This is a best practice for managing API calls in a structured way.
if (!process.env.NEXT_PUBLIC_API_URL) {
  console.error(
    "NEXT_PUBLIC_API_URL is not defined in your environment variables."
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
});

// Log the API base URL to the console for debugging purposes.
console.log(`API base URL: ${process.env.NEXT_PUBLIC_API_URL}`);

// Authentication functions
export const authApi = {
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
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update project details
  updateProject: async (projectId: string, name?: string, description?: string) => {
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
};

// Segmentation functions
export const segmentationApi = {
  // Start segmentation for a project
  startSegmentation: async (projectId: string) => {
    try {
      const response = await api.post(`/segmentation/start-segmentation/${projectId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get segmentation results for a project
  getSegmentationResults: async (projectId: string) => {
    try {
      const response = await api.get(`/segmentation/segmentation-results/${projectId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Start manual segmentation
  startManualSegmentation: async (projectId: string, data: {
    image_name: string;
    bbox: number[];
    segmentationName?: string;
    segmentationDescription?: string;
  }) => {
    try {
      const response = await api.post(`/segmentation/start-manual-segmentation/${projectId}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Save manual segmentation
  saveManualSegmentation: async (projectId: string, data: {
    name?: string;
    description?: string;
    frames?: any[];
  }) => {
    try {
      const response = await api.put(`/segmentation/save-manual-segmentation/${projectId}`, data);
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
      const response = await api.get(`/segmentation/export-project-data/${projectId}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Admin functions
export const adminApi = {
  // Get all users with projects (admin only)
  getAllUsersWithProjects: async () => {
    try {
      const response = await api.get("/project/get-allusers-with-projects");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all jobs status (admin only)
  getAllJobsStatus: async (page: number = 1, limit: number = 50) => {
    try {
      const response = await api.get(`/segmentation/admin-check-all-jobs-status?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user role (admin only)
  updateUserRole: async (username: string, newRole: string) => {
    try {
      const response = await api.patch("/auth/update-user-role", {
        username,
        newrole: newRole,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all users (admin only)
  getAllUsers: async () => {
    try {
      const response = await api.get("/auth/fetch-all-users");
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
};

export default api;
