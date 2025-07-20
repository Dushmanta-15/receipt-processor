import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const receiptAPI = {
  // Get all receipts with optional filters
  getReceipts: (params = {}) => api.get('/receipts/', { params }),
  
  // Get single receipt
  getReceipt: (id) => api.get(`/receipts/${id}/`),
  
  // Upload receipt
  uploadReceipt: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/receipts/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Update receipt
  updateReceipt: (id, data) => api.patch(`/receipts/${id}/`, data),
  
  // Delete receipt
  deleteReceipt: (id) => api.delete(`/receipts/${id}/`),
  
  // Get analytics
  getAnalytics: (params = {}) => api.get('/receipts/analytics/', { params }),
  
  // Advanced search
  searchReceipts: (params) => api.get('/receipts/search/', { params }),
  
  // Export receipts
  exportReceipts: (format = 'csv', params = {}) => 
    api.get('/receipts/export/', { 
      params: { format, ...params },
      responseType: 'blob'
    }),
};

export default api;