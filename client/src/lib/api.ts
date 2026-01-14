// API configuration for Vercel deployment
// All API calls will be relative to the same domain

const isDevelopment = import.meta.env.DEV;

export const api = {
  // Helper function to make API calls
  fetch: async (endpoint: string, options?: RequestInit) => {
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
      return response;
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  },
  
  // Test API connection
  test: async () => {
    try {
      const response = await fetch('/api/health');
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