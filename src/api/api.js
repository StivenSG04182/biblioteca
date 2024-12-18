import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Interceptor para agregar el token de autenticación a las solicitudes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const login = (email, password) => api.post('/api/auth/login', { email, password });
export const register = (email, password) => api.post('/api/auth/register', { email, password });
export const getQuestions = () => api.get('/api/questions');
export const createQuestion = (questionData) => api.post('/api/questions', questionData);
export const updateQuestion = (id, questionData) => api.put(`/api/questions/${id}`, questionData);
export const deleteQuestion = (id) => api.delete(`/api/questions/${id}`);
export const getStats = () => api.get('/api/stats');
export const getUserSettings = () => api.get('/api/settings');
export const updateUserSettings = (settings) => api.put('/api/settings', settings);

export default api;

