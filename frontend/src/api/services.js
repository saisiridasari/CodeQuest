import api from './axios';

/* ── Auth ── */
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
  getMe: () => api.get('/auth/me'),
};

/* ── Problems ── */
export const problemsAPI = {
  getAll: (params) => api.get('/problems', { params }),
  getOne: (idOrSlug) => api.get(`/problems/${idOrSlug}`),
  getRandom: (params) => api.get('/problems/random', { params }),
};

/* ── Submissions ── */
export const submissionsAPI = {
  submit: (data) => api.post('/submissions/submit', data),
  run: (data) => api.post('/submissions/run', data),
  getAll: (params) => api.get('/submissions', { params }),
  getOne: (id) => api.get(`/submissions/${id}`),
};

/* ── Contests ── */
export const contestsAPI = {
  getAll: (params) => api.get('/contests', { params }),
  getOne: (idOrSlug) => api.get(`/contests/${idOrSlug}`),
  join: (id) => api.post(`/contests/${id}/join`),
  getLeaderboard: (id) => api.get(`/contests/${id}/leaderboard`),
};

/* ── Leaderboard ── */
export const leaderboardAPI = {
  getGlobal: (params) => api.get('/leaderboard/global', { params }),
  getWeekly: () => api.get('/leaderboard/weekly'),
  getMyRank: () => api.get('/leaderboard/my-rank'),
};

/* ── Achievements ── */
export const achievementsAPI = {
  getAll: () => api.get('/achievements'),
  getMy: () => api.get('/achievements/my'),
};

/* ── Notifications ── */
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

/* ── AI ── */
export const aiAPI = {
  getHint: (data) => api.post('/ai/hint', data),
  explainError: (data) => api.post('/ai/explain-error', data),
  explainProblem: (data) => api.post('/ai/explain-problem', data),
  optimize: (data) => api.post('/ai/optimize', data),
};

/* ── User ── */
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getDashboard: () => api.get('/users/dashboard'),
  changePassword: (data) => api.put('/users/change-password', data),
  getPublicProfile: (username) => api.get(`/users/public/${username}`),
};

/* ── Admin ── */
export const adminAPI = {
  // Dashboard
  getStats: () => api.get('/admin/stats'),
  getAnalytics: () => api.get('/admin/analytics'),
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  // Problems
  getProblems: (params) => api.get('/admin/problems', { params }),
  createProblem: (data) => api.post('/admin/problems', data),
  updateProblem: (id, data) => api.put(`/admin/problems/${id}`, data),
  deleteProblem: (id) => api.delete(`/admin/problems/${id}`),
  // Contests
  getContests: (params) => api.get('/admin/contests', { params }),
  createContest: (data) => api.post('/admin/contests', data),
  updateContest: (id, data) => api.put(`/admin/contests/${id}`, data),
  deleteContest: (id) => api.delete(`/admin/contests/${id}`),
};
