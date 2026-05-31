import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://main-store-3pr5.onrender.com/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data: { email: string; password: string; device?: string }) =>
    api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  getMe: () => api.get('/auth/me'),
  changePassword: (data: any) => api.post('/auth/change-password', data),
};

// Product API
export const productApi = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  getLowStock: () => api.get('/products/low-stock'),
};

// Inventory API
export const inventoryApi = {
  getAll: (params?: any) => api.get('/inventory', { params }),
  adjust: (id: string, data: any) => api.post(`/inventory/${id}/adjust`, data),
  getLogs: (params?: any) => api.get('/inventory/logs', { params }),
  stockCount: (branchId: string, data: any) => api.post(`/inventory/${branchId}/count`, data),
};

// Sales API
export const saleApi = {
  create: (data: any) => api.post('/sales', data),
  getAll: (params?: any) => api.get('/sales', { params }),
  getById: (id: string) => api.get(`/sales/${id}`),
  processReturn: (id: string, data: any) => api.post(`/sales/${id}/return`, data),
  getDailySummary: (params?: any) => api.get('/sales/daily-summary', { params }),
};

// Customer API
export const customerApi = {
  getAll: (params?: any) => api.get('/customers', { params }),
  getById: (id: string) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: string, data: any) => api.put(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
};

// Branch API
export const branchApi = {
  getAll: () => api.get('/branches'),
  getById: (id: string) => api.get(`/branches/${id}`),
  create: (data: any) => api.post('/branches', data),
  update: (id: string, data: any) => api.put(`/branches/${id}`, data),
};

// Transfer API
export const transferApi = {
  getAll: (params?: any) => api.get('/transfers', { params }),
  create: (data: any) => api.post('/transfers', data),
  updateStatus: (id: string, data: any) => api.put(`/transfers/${id}/status`, data),
};

// Repair API
export const repairApi = {
  getAll: (params?: any) => api.get('/repairs', { params }),
  create: (data: any) => api.post('/repairs', data),
  updateStatus: (id: string, data: any) => api.put(`/repairs/${id}/status`, data),
};

// Expense API
export const expenseApi = {
  getAll: (params?: any) => api.get('/expenses', { params }),
  create: (data: any) => api.post('/expenses', data),
  getCategories: () => api.get('/expenses/categories'),
};

// Cashbox API
export const cashboxApi = {
  getAll: (params?: any) => api.get('/cashboxes', { params }),
  create: (data: any) => api.post('/cashboxes', data),
  getById: (id: string) => api.get(`/cashboxes/${id}`),
  createTransaction: (id: string, data: any) => api.post(`/cashboxes/${id}/transactions`, data),
};

// Financial Transaction API
export const financialApi = {
  getAll: (params?: any) => api.get('/financial-transactions', { params }),
  create: (data: any) => api.post('/financial-transactions', data),
  getDailyReport: (params?: any) => api.get('/financial-transactions/daily-report', { params }),
};

// Dashboard API
export const dashboardApi = {
  getStats: (params?: any) => api.get('/dashboard/stats', { params }),
  getCharts: (params?: any) => api.get('/dashboard/charts', { params }),
};

// Report API
export const reportApi = {
  getSales: (params?: any) => api.get('/reports/sales', { params }),
  getInventory: (params?: any) => api.get('/reports/inventory', { params }),
  getProfit: (params?: any) => api.get('/reports/profit', { params }),
  getEmployees: (params?: any) => api.get('/reports/employees', { params }),
};

// Notification API
export const notificationApi = {
  getAll: (params?: any) => api.get('/notifications', { params }),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};
