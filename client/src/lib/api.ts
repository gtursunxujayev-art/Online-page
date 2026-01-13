// API configuration for Vercel deployment
// This allows API URLs to be configured via environment variables

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = {
  // Helper function to make API calls
  fetch: async (endpoint: string, options?: RequestInit) => {
    const url = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;
    return fetch(url, options);
  },

  // Specific API endpoints
  leads: {
    create: (data: any) => 
      api.fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
    getAll: () => api.fetch('/api/leads', { credentials: 'include' })
  },

  auth: {
    login: (data: any) =>
      api.fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
    logout: () => 
      api.fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }),
    check: () => api.fetch('/api/auth/check', { credentials: 'include' }),
    updateCredentials: (data: any) =>
      api.fetch('/api/auth/credentials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
  },

  content: {
    get: () => api.fetch('/api/content'),
    update: (data: any) =>
      api.fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      })
  },

  kommo: {
    getPipelines: () => api.fetch('/api/kommo/pipelines', { credentials: 'include' })
  },

  settings: {
    getPipelineStage: () => api.fetch('/api/settings/pipeline-stage', { credentials: 'include' }),
    updatePipelineStage: (data: any) =>
      api.fetch('/api/settings/pipeline-stage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      })
  }
};