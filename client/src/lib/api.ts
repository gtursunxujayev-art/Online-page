// API configuration for Vercel deployment
// Use environment variable for API URL in production

const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Helper function to build full API URL
const buildApiUrl = (endpoint: string): string => {
  // If we have a custom API URL, use it
  if (API_BASE_URL) {
    return `${API_BASE_URL}${endpoint}`;
  }
  // Otherwise use relative path (for same-domain deployment)
  return endpoint;
};

// Utility function for direct fetch calls (used by components that don't use api.fetch)
export const fetchWithBaseUrl = async (endpoint: string, options?: RequestInit): Promise<Response> => {
  const url = buildApiUrl(endpoint);
  console.log(`Direct fetch to: ${url}`, { isDevelopment, API_BASE_URL });
  return fetch(url, options);
};

export const api = {
  // Helper function to make API calls
  fetch: async (endpoint: string, options?: RequestInit) => {
    const url = buildApiUrl(endpoint);
    console.log(`API call to: ${url}`, { isDevelopment, API_BASE_URL });
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
      return response;
    } catch (error) {
      console.error(`API call failed for ${url}:`, error);
      throw error;
    }
  },
  
  // Test API connection
  test: async () => {
    try {
      const response = await fetchWithBaseUrl('/api/health');
      return response.ok;
    } catch {
      return false;
    }
  },

  // Specific API endpoints
  leads: {
    create: (data: any) => 
      api.fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
    getAll: () => api.fetch('/api/leads')
  },

  content: {
    get: () => api.fetch('/api/content'),
    update: (data: any) =>
      api.fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
  },

  amocrm: {
    getPipelines: () => api.fetch('/api/amocrm/pipelines')
  }
};