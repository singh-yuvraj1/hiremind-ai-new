import axios from 'axios';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  const cleanUrl = envUrl.trim().replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
});

// attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// redirect to login on 401 only for protected resource requests
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const url = err.config?.url || '';
      const isAuthEndpoint =
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/google') ||
        url.includes('/auth/forgot-password') ||
        url.includes('/auth/reset-password');

      if (!isAuthEndpoint) {
        localStorage.removeItem('hm_token');
        localStorage.removeItem('hm_user');
        const path = window.location.pathname;
        const isPublicPage =
          path === '/' ||
          path === '/login' ||
          path === '/signup' ||
          path === '/forgot-password' ||
          path.startsWith('/reset-password');

        if (!isPublicPage) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

/* ── Interview API ───────────────────────────────────────────────── */
export const interviewAPI = {
  getQuestions: (role, technology, difficulty, count, category, roundType, fieldId, technologies) => {
    const params = new URLSearchParams({
      role: role || 'fullstack',
      difficulty: difficulty || 'medium',
      count: String(count || 5),
    });
    if (technologies) {
      const techStr = Array.isArray(technologies) ? technologies.join(',') : technologies;
      params.append('technologies', techStr);
    } else if (technology) {
      params.append('technology', technology);
    }
    if (category) params.append('category', category);
    if (roundType) params.append('roundType', roundType);
    if (fieldId) params.append('fieldId', fieldId);
    return api.get(`/interviews/questions?${params.toString()}`);
  },
  save:         (data) => api.post('/interviews', data),
  getAll:       ()     => api.get('/interviews'),
  getOne:       (id)   => api.get(`/interviews/${id}`),
  getRoles:     ()     => api.get('/interviews/roles'),
  getTaxonomy:  ()     => api.get('/interviews/taxonomy'),
};

/* ── Mock Test API ───────────────────────────────────────────────── */
export const mockAPI = {
  getQuestions: (type, count, difficulty, role) =>
    api.get(`/mock/questions?type=${type}&count=${count}&difficulty=${difficulty}&role=${role}`),
  submit:     (data) => api.post('/mock/submit', data),
  getHistory: ()     => api.get('/mock/history'),
};

/* ── Job API ─────────────────────────────────────────────────────── */
export const jobAPI = {
  getAll:     (query = '') => api.get(`/jobs${query ? '?' + query : ''}`),
  getOne:     (id)         => api.get(`/jobs/${id}`),
  toggleSave: (id)         => api.post(`/jobs/${id}/save`),
  getSaved:   ()           => api.get('/jobs/saved'),
  apply:      (id)         => api.post(`/jobs/${id}/apply`),  // Premium only
};

/* ── Resume API ──────────────────────────────────────────────────── */
export const resumeAPI = {
  analyze: (data, isFormData = false) => {
    if (isFormData) {
      return api.post('/resume/analyze', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.post('/resume/analyze', data);
  },
  getLast: () => api.get('/resume/last'),
  getHistory: () => api.get('/resume/history'),
  getOne: (id) => api.get(`/resume/${id}`),
};

/* ── Payment API ─────────────────────────────────────────────────── */
export const paymentAPI = {
  createOrder:  ()     => api.post('/payment/create-order'),
  verifyPayment:(data) => api.post('/payment/verify', data),
  getStatus:    ()     => api.get('/payment/status'),
};

/* ── Auth API ────────────────────────────────────────────────────── */
export const authAPI = {
  me:           ()       => api.get('/auth/me'),
  usage:        ()       => api.get('/auth/usage'),
  updateAvatar: (avatar) => api.put('/auth/avatar', { avatar }),
};

export default api;