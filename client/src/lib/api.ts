// API configuration for Vercel deployment
// All API calls will be relative to the same domain

export const api = {
  // Helper function to make API calls
  fetch: async (endpoint: string, options?: RequestInit) => {
    return fetch(endpoint, options);
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