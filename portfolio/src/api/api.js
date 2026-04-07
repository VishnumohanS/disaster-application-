import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const user = localStorage.getItem('user');
  if (user) {
    const { token } = JSON.parse(user);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Resource helpers
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const inventoryAPI = {
  getAll: (params) => api.get('/inventory', { params }),
  getStats: () => api.get('/inventory/stats'),
  getItem: (id) => api.get(`/inventory/item/${id}`),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
  bulkUpdate: (updates) => api.post('/inventory/bulk-update', { updates }),
};

export const volunteerAPI = {
  getAll: (params) => api.get('/volunteers', { params }),
  getStats: () => api.get('/volunteers/stats'),
  register: (data) => api.post('/volunteers', data),
  update: (id, data) => api.put(`/volunteers/${id}`, data),
  dispatch: (id, centerId) => api.put(`/volunteers/dispatch/${id}`, { centerId }),
  delete: (id) => api.delete(`/volunteers/${id}`),
};

export const centerAPI = {
  getAll: () => api.get('/centers'),
  getStats: () => api.get('/centers/stats'),
  getById: (id) => api.get(`/centers/${id}`),
  create: (data) => api.post('/centers', data),
  update: (id, data) => api.put(`/centers/${id}`, data),
  delete: (id) => api.delete(`/centers/${id}`),
};

export const dispatchAPI = {
  getAll: (params) => api.get('/dispatch', { params }),
  getActive: () => api.get('/dispatch/active'),
  getStats: () => api.get('/dispatch/stats'),
  create: (data) => api.post('/dispatch', data),
  updateStatus: (id, status) => api.put(`/dispatch/${id}`, { status }),
  delete: (id) => api.delete(`/dispatch/${id}`),
};

export const zoneAPI = {
  getAll: (params) => api.get('/zones', { params }),
  getStats: () => api.get('/zones/stats'),
  getById: (id) => api.get(`/zones/${id}`),
  report: (data) => api.post('/zones', data),
  update: (id, data) => api.put(`/zones/${id}`, data),
  delete: (id) => api.delete(`/zones/${id}`),
};
