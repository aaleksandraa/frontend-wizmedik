import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create separate axios instance for admin API to avoid circular dependencies
const adminApiInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// Add auth token interceptor
adminApiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for 401 errors
adminApiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Admin API - separated to avoid bundling with public pages
export const adminAPI = {
  // Generic admin methods
  get: (url: string, config?: any) => adminApiInstance.get(url, config),
  post: (url: string, data?: any, config?: any) => adminApiInstance.post(url, data, config),
  put: (url: string, data?: any, config?: any) => adminApiInstance.put(url, data, config),
  delete: (url: string, config?: any) => adminApiInstance.delete(url, config),
  
  // User management
  getUsers: (params?: any) => adminApiInstance.get('/admin/users', { params }),
  updateUserRole: (id: number, role: string) => adminApiInstance.put(`/admin/users/${id}/role`, { role }),
  
  // Doctor management
  getDoctors: (params?: any) => adminApiInstance.get('/admin/doctors', { params }),
  createDoctor: (data: any) => adminApiInstance.post('/admin/doctors', data),
  updateDoctor: (id: number, data: any) => adminApiInstance.put(`/admin/doctors/${id}`, data),
  deleteDoctor: (id: number) => adminApiInstance.delete(`/admin/doctors/${id}`),
  
  // Clinic management
  getClinics: (params?: any) => adminApiInstance.get('/admin/clinics', { params }),
  createClinic: (data: any) => adminApiInstance.post('/admin/clinics', data),
  updateClinic: (id: number, data: any) => adminApiInstance.put(`/admin/clinics/${id}`, data),
  deleteClinic: (id: number) => adminApiInstance.delete(`/admin/clinics/${id}`),
  getCities: () => adminApiInstance.get('/admin/cities'),
  createCity: (data: any) => adminApiInstance.post('/admin/cities', data),
  updateCity: (id: number, data: any) => adminApiInstance.put(`/admin/cities/${id}`, data),
  deleteCity: (id: number) => adminApiInstance.delete(`/admin/cities/${id}`),
  createSpecialty: (data: any) => adminApiInstance.post('/admin/specialties', data),
  getSpecialty: (id: number) => adminApiInstance.get(`/admin/specialties/${id}`),
  updateSpecialty: (id: number, data: any) => {
    // If data is FormData, use POST with _method override for Laravel
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      return adminApiInstance.post(`/admin/specialties/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return adminApiInstance.put(`/admin/specialties/${id}`, data);
  },
  deleteSpecialty: (id: number) => adminApiInstance.delete(`/admin/specialties/${id}`),
  reorderSpecialties: (specialties: Array<{ id: number; sort_order: number }>) => 
    adminApiInstance.post('/admin/specialties/reorder', { specialties }),
  getTemplates: () => adminApiInstance.get('/admin/settings/templates'),
  updateTemplates: (data: any) => adminApiInstance.put('/admin/settings/templates', data),
  getDoctorCardSettings: () => adminApiInstance.get('/admin/settings/doctor-card'),
  updateDoctorCardSettings: (data: any) => adminApiInstance.put('/admin/settings/doctor-card', data),
  getClinicCardSettings: () => adminApiInstance.get('/admin/settings/clinic-card'),
  updateClinicCardSettings: (data: any) => adminApiInstance.put('/admin/settings/clinic-card', data),
};

export default adminAPI;
