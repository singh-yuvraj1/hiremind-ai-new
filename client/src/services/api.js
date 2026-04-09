import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hm_token');
      localStorage.removeItem('hm_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

/* ── Interview API ───────────────────────────────────────────────── */
export const interviewAPI = {
  getQuestions: (role, category, difficulty, count) =>
    api.get(`/interviews/questions?role=${role}&category=${category}&difficulty=${difficulty}&count=${count}`),
  save:         (data) => api.post('/interviews', data),
  getAll:       ()     => api.get('/interviews'),
  getOne:       (id)   => api.get(`/interviews/${id}`),
  getRoles:     ()     => api.get('/interviews/roles'),
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
};

/* ── Payment API ─────────────────────────────────────────────────── */
export const paymentAPI = {
  createOrder:  ()     => api.post('/payment/create-order'),
  verifyPayment:(data) => api.post('/payment/verify', data),
  getStatus:    ()     => api.get('/payment/status'),
};

/* ── Auth API ────────────────────────────────────────────────────── */
export const authAPI = {
  me:    () => api.get('/auth/me'),
  usage: () => api.get('/auth/usage'),
};

export default api;