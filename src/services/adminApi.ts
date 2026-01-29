import api from './api';

// Admin API - separated to avoid bundling with public pages
export const adminAPI = {
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  updateUserRole: (id: number, role: string) => api.put(`/admin/users/${id}/role`, { role }),
  createDoctor: (data: any) => api.post('/admin/doctors', data),
  updateDoctor: (id: number, data: any) => api.put(`/admin/doctors/${id}`, data),
  deleteDoctor: (id: number) => api.delete(`/admin/doctors/${id}`),
  createClinic: (data: any) => api.post('/admin/clinics', data),
  updateClinic: (id: number, data: any) => api.put(`/admin/clinics/${id}`, data),
  deleteClinic: (id: number) => api.delete(`/admin/clinics/${id}`),
  getCities: () => api.get('/admin/cities'),
  createCity: (data: any) => api.post('/admin/cities', data),
  updateCity: (id: number, data: any) => api.put(`/admin/cities/${id}`, data),
  deleteCity: (id: number) => api.delete(`/admin/cities/${id}`),
  createSpecialty: (data: any) => api.post('/admin/specialties', data),
  getSpecialty: (id: number) => api.get(`/admin/specialties/${id}`),
  updateSpecialty: (id: number, data: any) => {
    // If data is FormData, use POST with _method override for Laravel
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      return api.post(`/admin/specialties/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.put(`/admin/specialties/${id}`, data);
  },
  deleteSpecialty: (id: number) => api.delete(`/admin/specialties/${id}`),
  reorderSpecialties: (specialties: Array<{ id: number; sort_order: number }>) => 
    api.post('/admin/specialties/reorder', { specialties }),
  getTemplates: () => api.get('/admin/settings/templates'),
  updateTemplates: (data: any) => api.put('/admin/settings/templates', data),
  getDoctorCardSettings: () => api.get('/admin/settings/doctor-card'),
  updateDoctorCardSettings: (data: any) => api.put('/admin/settings/doctor-card', data),
  getClinicCardSettings: () => api.get('/admin/settings/clinic-card'),
  updateClinicCardSettings: (data: any) => api.put('/admin/settings/clinic-card', data),
};

export default adminAPI;
