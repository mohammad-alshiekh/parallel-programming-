import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  register: (email: string, password: string, firstName: string, lastName: string) =>
    api.post('/auth/register', { email, password, firstName, lastName }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

// Products endpoints
export const productsAPI = {
  getAll: () => api.get('/products'),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (name: string, description: string, price: number, quantity: number) =>
    api.post('/products', { name, description, price, quantity }),
  reserve: (id: string, quantity: number) =>
    api.post(`/products/${id}/reserve`, { quantity }),
};

// Orders endpoints
export const ordersAPI = {
  create: (items: Array<{ productId: string; quantity: number }>) =>
    api.post('/orders', { items }),
  getById: (id: string) => api.get(`/orders/${id}`),
  getByUserId: (userId: string) => api.get(`/orders/user/${userId}`),
};
