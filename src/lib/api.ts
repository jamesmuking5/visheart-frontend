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

export default api;
