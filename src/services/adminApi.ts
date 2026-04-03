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
  sendDoctorInvite: (id: number, data?: any) => adminApiInstance.post(`/admin/doctors/${id}/send-invite`, data),
  
  // Clinic management
  getClinics: (params?: any) => adminApiInstance.get('/admin/clinics', { params }),
  createClinic: (data: any) => adminApiInstance.post('/admin/clinics', data),
  updateClinic: (id: number, data: any) => adminApiInstance.put(`/admin/clinics/${id}/manage`, data),
  deleteClinic: (id: number) => adminApiInstance.delete(`/admin/clinics/${id}`),
  sendClinicInvite: (id: number, data?: any) => adminApiInstance.post(`/admin/clinics/${id}/send-invite`, data),
  getLaboratories: (params?: any) => adminApiInstance.get('/admin/laboratories', { params }),
  getLaboratory: (id: number) => adminApiInstance.get(`/admin/laboratories/${id}`),
  createLaboratory: (data: any) => adminApiInstance.post('/admin/laboratories', data),
  updateLaboratory: (id: number, data: any) => adminApiInstance.put(`/admin/laboratories/${id}`, data),
  deleteLaboratory: (id: number) => adminApiInstance.delete(`/admin/laboratories/${id}`),
  sendLaboratoryInvite: (id: number, data?: any) => adminApiInstance.post(`/admin/laboratories/${id}/send-invite`, data),
  getSpas: (params?: any) => adminApiInstance.get('/admin/spas', { params }),
  getSpa: (id: number) => adminApiInstance.get(`/admin/spas/${id}`),
  createSpa: (data: any) => adminApiInstance.post('/admin/spas', data),
  updateSpa: (id: number, data: any) => adminApiInstance.put(`/admin/spas/${id}`, data),
  deleteSpa: (id: number) => adminApiInstance.delete(`/admin/spas/${id}`),
  sendSpaInvite: (id: number, data?: any) => adminApiInstance.post(`/admin/spas/${id}/send-invite`, data),
  getCareHomes: (params?: any) => adminApiInstance.get('/admin/care-homes', { params }),
  getCareHome: (id: number) => adminApiInstance.get(`/admin/care-homes/${id}`),
  createCareHome: (data: any) => adminApiInstance.post('/admin/care-homes', data),
  updateCareHome: (id: number, data: any) => adminApiInstance.put(`/admin/care-homes/${id}`, data),
  deleteCareHome: (id: number) => adminApiInstance.delete(`/admin/care-homes/${id}`),
  sendCareHomeInvite: (id: number, data?: any) => adminApiInstance.post(`/admin/care-homes/${id}/send-invite`, data),
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
  getServicePages: (params?: any) => adminApiInstance.get('/admin/service-pages', { params }),
  getServicePage: (id: number) => adminApiInstance.get(`/admin/service-pages/${id}`),
  createServicePage: (data: any) => adminApiInstance.post('/admin/service-pages', data),
  updateServicePage: (id: number, data: any) => adminApiInstance.put(`/admin/service-pages/${id}`, data),
  deleteServicePage: (id: number) => adminApiInstance.delete(`/admin/service-pages/${id}`),
  getTemplates: () => adminApiInstance.get('/admin/settings/templates'),
  updateTemplates: (data: any) => adminApiInstance.put('/admin/settings/templates', data),
  getDoctorCardSettings: () => adminApiInstance.get('/admin/settings/doctor-card'),
  updateDoctorCardSettings: (data: any) => adminApiInstance.put('/admin/settings/doctor-card', data),
  getClinicCardSettings: () => adminApiInstance.get('/admin/settings/clinic-card'),
  updateClinicCardSettings: (data: any) => adminApiInstance.put('/admin/settings/clinic-card', data),

  // Pharmacy management
  getPharmacies: (params?: any) => adminApiInstance.get('/admin/pharmacies', { params }),
  createPharmacy: (data: any) => adminApiInstance.post('/admin/pharmacies', data),
  updatePharmacy: (id: number, data: any) => adminApiInstance.put(`/admin/pharmacies/${id}`, data),
  deletePharmacy: (id: number) => adminApiInstance.delete(`/admin/pharmacies/${id}`),
  sendPharmacyInvite: (id: number, data?: any) => adminApiInstance.post(`/admin/pharmacies/${id}/send-invite`, data),

  // Medicines management
  getMedicines: (params?: any) => adminApiInstance.get('/admin/lijekovi', { params }),
  updateMedicine: (id: number, data: any) => adminApiInstance.put(`/admin/lijekovi/${id}`, data),
  importMedicinesXml: (formData: FormData) =>
    adminApiInstance.post('/admin/lijekovi/import-xml', formData),
  importMedicinesXmlDefault: () =>
    adminApiInstance.post('/admin/lijekovi/import-xml', { use_default: true }),
  importMedicinesRegistry: (formData: FormData) =>
    adminApiInstance.post('/admin/lijekovi/import-registar', formData),
  getMedicinesAudit: (params?: any) => adminApiInstance.get('/admin/lijekovi/audit-quality', { params }),
  getRfzoLists: () => adminApiInstance.get('/admin/rfzo-liste'),
  createRfzoList: (data: any) => adminApiInstance.post('/admin/rfzo-liste', data),
  updateRfzoList: (id: number, data: any) => adminApiInstance.put(`/admin/rfzo-liste/${id}`, data),
  deleteRfzoList: (id: number) => adminApiInstance.delete(`/admin/rfzo-liste/${id}`),
};

export default adminAPI;
