// API Configuration
// In production, this will use the VITE_API_URL environment variable
// In development, it defaults to localhost:3001

const getApiUrl = () => {
  // Check if we're in development (Vite sets this)
  if (import.meta.env.DEV) {
    // In development, use proxy (handled by vite.config.js) or localhost
    return '';
  }
  
  // In production, use environment variable or default to relative path
  // If VITE_API_URL is set, use it; otherwise use relative paths (same domain)
  const apiUrl = import.meta.env.VITE_API_URL || '';
  
  // Remove trailing slash if present
  return apiUrl.replace(/\/$/, '');
};

export const API_BASE_URL = getApiUrl();

// Helper function to build full API URL
export const getApiEndpoint = (endpoint) => {
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  if (API_BASE_URL) {
    return `${API_BASE_URL}/${cleanEndpoint}`;
  }
  
  // If no base URL, use relative path
  return `/${cleanEndpoint}`;
};

export default {
  API_BASE_URL,
  getApiEndpoint
};

