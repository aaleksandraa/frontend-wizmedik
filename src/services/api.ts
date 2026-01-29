import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only clear auth data on 401, but don't redirect
    // Let ProtectedRoute component handle redirects for protected pages
    // Public pages should continue to work even if some API calls return 401
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;

// Homepage API - single optimized endpoint
export const homepageAPI = {
  getData: () => {
    // Add cache busting in development
    const isDev = import.meta.env.DEV;
    const params = isDev ? { nocache: '1' } : {};
    return api.get('/homepage', { params });
  },
};

export const authAPI = {
  register: (data: any) => api.post('/register', data),
  login: (credentials: { email: string; password: string }) => api.post('/login', credentials),
  logout: () => api.post('/logout'),
  getUser: () => api.get('/user'),
  forgotPassword: (email: string) => api.post('/password/forgot', { email }),
  resetPassword: (data: any) => api.post('/password/reset', data),
};

export const doctorsAPI = {
  getAll: (params?: any) => api.get('/doctors', { params }),
  getBySlug: (slug: string) => api.get(`/doctors/slug/${slug}`),
  getById: (id: number) => api.get(`/doctors/${id}`),
  getServices: (id: number) => api.get(`/doctors/${id}/services`),
  getAvailableSlots: (id: number, params?: any) => api.get(`/doctors/${id}/available-slots`, { params }),
  getBookedSlots: (id: number, params?: any) => api.get(`/doctors/${id}/booked-slots`, { params }),
  getMyProfile: () => api.get('/doctors/me/profile'),
  updateProfile: (data: any) => api.put('/doctors/me/profile', data),
  updateSchedule: (data: any) => api.put('/doctors/me/schedule', data),
  getTemplates: () => api.get('/settings/templates'),
  
  // Doctor Dashboard - Service Categories
  dashboard: {
    getProfile: () => api.get('/doctor/profile'),
    getKategorije: () => api.get('/doctor/kategorije'),
    createKategorija: (data: any) => api.post('/doctor/kategorije', data),
    updateKategorija: (id: number, data: any) => api.put(`/doctor/kategorije/${id}`, data),
    deleteKategorija: (id: number) => api.delete(`/doctor/kategorije/${id}`),
    reorderKategorije: (data: any) => api.post('/doctor/kategorije/reorder', data),
    getUsluge: () => api.get('/doctor/usluge'),
    createUsluga: (data: any) => api.post('/doctor/usluge', data),
    updateUsluga: (id: number, data: any) => api.put(`/doctor/usluge/${id}`, data),
    deleteUsluga: (id: number) => api.delete(`/doctor/usluge/${id}`),
    reorderUsluge: (data: any) => api.post('/doctor/usluge/reorder', data),
  }
};

export const appointmentsAPI = {
  getMyAppointments: (params?: any) => api.get('/appointments/my', { params }),
  create: (data: any) => api.post('/appointments', data),
  createGuest: (data: any) => api.post('/appointments/guest', data),
  reschedule: (id: number, data: any) => api.put(`/appointments/${id}/reschedule`, data),
  cancel: (id: number) => api.delete(`/appointments/${id}`),
  getDoctorAppointments: (params?: any) => api.get('/appointments/doctor', { params }),
  createManual: (data: any) => api.post('/appointments/doctor/manual', data),
  updateStatus: (id: number, status: string) => api.put(`/appointments/${id}/status`, { status }),
};

export const clinicsAPI = {
  getAll: (params?: any) => api.get('/clinics', { params }),
  getBySlug: (slug: string) => api.get(`/clinics/${slug}`),
};

export const citiesAPI = {
  getAll: () => api.get('/cities'),
  getBySlug: (slug: string) => api.get(`/cities/${slug}`),
};

export const specialtiesAPI = {
  getAll: () => api.get('/specialties'),
  getWithCounts: () => api.get('/specialties/with-counts'),
  getBySlug: (slug: string) => api.get(`/specialties/${slug}`),
  getSearchData: () => api.get('/specialties/search-data'),
  smartSearch: (query: string) => api.get(`/specialties/smart-search/${encodeURIComponent(query)}`),
};

export const servicesAPI = {
  getMyServices: () => api.get('/services/my'),
  create: (data: any) => api.post('/services', data),
  update: (id: number, data: any) => api.put(`/services/${id}`, data),
  delete: (id: number) => api.delete(`/services/${id}`),
};

export const uploadAPI = {
  uploadImage: (file: File, folder: string) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteImage: (path: string) => api.delete('/upload/image', { data: { path } }),
};

export const clinicDashboardAPI = {
  getProfile: () => api.get('/clinic/profile'),
  updateProfile: (data: any) => api.put('/clinic/profile', data),
  changePassword: (data: any) => api.put('/clinic/change-password', data),
  getAppointments: (params?: any) => api.get('/clinic/appointments', { params }),
  getDoctors: () => api.get('/clinic/doctors'),
  updateAppointmentStatus: (id: number, status: string) => api.put(`/clinic/appointments/${id}/status`, { status }),
  getStatistics: () => api.get('/clinic/statistics'),
  // Stalni doktori
  addDoctor: (data: any) => api.post('/clinic/doctors', data),
  updateDoctor: (id: number, data: any) => api.put(`/clinic/doctors/${id}`, data),
  removeDoctor: (id: number) => api.delete(`/clinic/doctors/${id}`),
  // Pozivi postojećim doktorima (klinika -> doktor)
  searchExistingDoctors: (params?: any) => api.get('/clinic/search-existing-doctors', { params }),
  inviteDoctor: (data: any) => api.post('/clinic/invitations', data),
  getInvitations: () => api.get('/clinic/invitations'),
  cancelInvitation: (id: number) => api.delete(`/clinic/invitations/${id}`),
  // Zahtjevi od doktora (doktor -> klinika)
  getDoctorRequests: () => api.get('/clinic/doctor-requests'),
  respondToDoctorRequest: (id: number, status: 'accepted' | 'rejected', odgovor?: string) => 
    api.put(`/clinic/doctor-requests/${id}/respond`, { status, odgovor }),
  // Gostujući doktori
  getGuestDoctors: (params?: any) => api.get('/clinic/guest-doctors', { params }),
  addGuestDoctor: (data: any) => api.post('/clinic/guest-doctors', data),
  updateGuestDoctor: (id: number, data: any) => api.put(`/clinic/guest-doctors/${id}`, data),
  cancelGuestDoctor: (id: number, napomena?: string) => api.delete(`/clinic/guest-doctors/${id}`, { data: { napomena } }),
  searchDoctors: (params?: any) => api.get('/clinic/search-doctors', { params }),
  // Guest visit services (clinic)
  getGuestDoctorServices: (gostovanjeId: number) => api.get(`/clinic/guest-doctors/${gostovanjeId}/services`),
  addGuestDoctorService: (gostovanjeId: number, data: any) => api.post(`/clinic/guest-doctors/${gostovanjeId}/services`, data),
  updateGuestDoctorService: (gostovanjeId: number, uslugaId: number, data: any) => 
    api.put(`/clinic/guest-doctors/${gostovanjeId}/services/${uslugaId}`, data),
  deleteGuestDoctorService: (gostovanjeId: number, uslugaId: number) => 
    api.delete(`/clinic/guest-doctors/${gostovanjeId}/services/${uslugaId}`),
  // Kalendar i termini
  getCalendarData: (params?: any) => api.get('/clinic/calendar-data', { params }),
  getAppointmentsByDate: (params?: any) => api.get('/clinic/appointments-by-date', { params }),
  createManualAppointment: (data: any) => api.post('/clinic/appointments/manual', data),
};

export const guestVisitsAPI = {
  getDoctorVisits: (params?: any) => api.get('/doctors/my-guest-visits', { params }),
  getDoctorPublicVisits: (doctorId: number) => api.get(`/doctors/${doctorId}/guest-visits`),
  respond: (id: number, status: 'confirmed' | 'cancelled', napomena?: string) => 
    api.put(`/doctors/guest-visits/${id}/respond`, { status, napomena }),
  cancel: (id: number, napomena?: string) => api.delete(`/doctors/guest-visits/${id}`, { data: { napomena } }),
  getClinicSchedule: (clinicId: number) => api.get(`/clinics/${clinicId}/guest-schedule`),
  // Guest visit services (doctor)
  getServices: (gostovanjeId: number) => api.get(`/doctors/guest-visits/${gostovanjeId}/services`),
  addService: (gostovanjeId: number, data: any) => api.post(`/doctors/guest-visits/${gostovanjeId}/services`, data),
  updateService: (gostovanjeId: number, uslugaId: number, data: any) => 
    api.put(`/doctors/guest-visits/${gostovanjeId}/services/${uslugaId}`, data),
  deleteService: (gostovanjeId: number, uslugaId: number) => 
    api.delete(`/doctors/guest-visits/${gostovanjeId}/services/${uslugaId}`),
  // Clinic invitations for doctors (klinika -> doktor)
  getClinicInvitations: () => api.get('/doctors/clinic-invitations'),
  respondToInvitation: (id: number, status: 'accepted' | 'rejected', odgovor?: string) => 
    api.put(`/doctors/clinic-invitations/${id}/respond`, { status, odgovor }),
  // Doctor requests to join clinic (doktor -> klinika)
  searchClinics: (params?: any) => api.get('/doctors/search-clinics', { params }),
  requestToJoinClinic: (data: any) => api.post('/doctors/clinic-requests', data),
  cancelClinicRequest: (id: number) => api.delete(`/doctors/clinic-requests/${id}`),
  // Leave clinic
  leaveClinic: () => api.post('/doctors/leave-clinic'),
};

// Admin API moved to separate file (adminApi.ts) to avoid bundling with public pages

export const settingsAPI = {
  getTemplates: () => api.get('/settings/templates'),
  getDoctorCardSettings: () => api.get('/settings/doctor-card'),
  getClinicCardSettings: () => api.get('/settings/clinic-card'),
  getHomepageSettings: () => api.get('/settings/homepage'),
  getGlobalColors: () => api.get('/settings/colors'),
  getSpecialtyTemplate: () => api.get('/settings/specialty-template'),
  getBlogTypography: () => api.get('/settings/blog-typography'),
  getListingTemplate: (type: string) => api.get(`/settings/listing-template?type=${type}`),
  // Admin
  updateTemplates: (data: any) => api.put('/admin/settings/templates', data),
  updateDoctorCardSettings: (data: any) => api.put('/admin/settings/doctor-card', data),
  updateClinicCardSettings: (data: any) => api.put('/admin/settings/clinic-card', data),
  updateHomepageSettings: (data: any) => api.put('/admin/settings/homepage', data),
  updateSpecialtyTemplate: (template: string, showStats?: boolean) => api.post('/admin/settings/specialty-template', { template, show_stats: showStats }),
  updateBlogTypography: (data: any) => api.put('/settings/blog-typography', data),
  updateListingTemplate: (data: { type: string; template: string }) => api.put('/settings/listing-template', data),
};

export const blogAPI = {
  getPosts: (params?: any) => api.get('/blog', { params }),
  getPost: (slug: string) => api.get(`/blog/${slug}`),
  getPostBySlug: (slug: string) => api.get(`/blog/${slug}`),
  getHomepagePosts: () => api.get('/blog/homepage'),
  getCategories: () => api.get('/blog/categories'),
  getAuthors: () => api.get('/blog/authors'),
  getDoctorPosts: (doctorSlug: string) => api.get(`/blog/doctor/${doctorSlug}`),
  canDoctorsWrite: () => api.get('/blog/can-doctors-write'),
  // Doctor
  getMyPosts: () => api.get('/blog/my-posts'),
  createPost: (data: any) => api.post('/blog/posts', data),
  updatePost: (slug: string, data: any) => api.put(`/blog/posts/${slug}`, data),
  deletePost: (id: number) => api.delete(`/blog/posts/${id}`),
  // Admin
  adminGetPosts: (params?: any) => api.get('/admin/blog/posts', { params }),
  adminCreatePost: (data: any) => api.post('/admin/blog/posts', data),
  adminUpdatePost: (id: number, data: any) => api.put(`/admin/blog/posts/${id}`, data),
  adminDeletePost: (id: number) => api.delete(`/admin/blog/posts/${id}`),
  adminCreateCategory: (data: any) => api.post('/admin/blog/categories', data),
  adminUpdateCategory: (id: number, data: any) => api.put(`/admin/blog/categories/${id}`, data),
  adminUpdateCategoriesOrder: (categories: Array<{id: number; sort_order: number}>) => 
    api.put('/admin/blog/categories-order', { categories }),
  adminDeleteCategory: (id: number) => api.delete(`/admin/blog/categories/${id}`),
  getSettings: () => api.get('/admin/blog/settings'),
  updateSettings: (data: any) => api.put('/admin/blog/settings', data),
};

export const pitanjaAPI = {
  getPitanja: (params?: any) => api.get('/pitanja', { params }),
  getPitanje: (slug: string) => api.get(`/pitanja/${slug}`),
  postaviPitanje: (data: any) => api.post('/pitanja', data),
  getPopularneTagove: () => api.get('/pitanja/tagovi/popularni'),
  lajkujOdgovor: (odgovorId: number) => api.post(`/pitanja/odgovori/${odgovorId}/lajk`),
  odgovoriNaPitanje: (pitanjeId: number, sadrzaj: string) => api.post(`/pitanja/${pitanjeId}/odgovori`, { sadrzaj }),
  getNotifikacije: (params?: any) => api.get('/pitanja/notifikacije', { params }),
  oznaciNotifikacijuKaoProcitanu: (notifikacijaId: number) => api.put(`/pitanja/notifikacije/${notifikacijaId}/procitano`),
};

export const notifikacijeAPI = {
  getAll: () => api.get('/notifikacije'),
  getNeprocitane: () => api.get('/notifikacije/neprocitane'),
  markAsRead: (id: number) => api.put(`/notifikacije/${id}/procitaj`),
  markAllAsRead: () => api.put('/notifikacije/procitaj-sve'),
  markByTypeAsRead: (types: string[]) => api.put('/notifikacije/procitaj-po-tipu', { types }),
  delete: (id: number) => api.delete(`/notifikacije/${id}`),
};

export const legalAPI = {
  // Public
  getCookieSettings: () => api.get('/settings/cookie'),
  getPrivacyPolicy: () => api.get('/settings/privacy-policy'),
  getTermsOfService: () => api.get('/settings/terms-of-service'),
  // Admin
  getLegalSettings: () => api.get('/admin/settings/legal'),
  updateCookieSettings: (data: any) => api.put('/admin/settings/cookie', data),
  updatePrivacyPolicy: (data: any) => api.put('/admin/settings/privacy-policy', data),
  updateTermsOfService: (data: any) => api.put('/admin/settings/terms-of-service', data),
};

export const laboratoriesAPI = {
  // Public routes
  getAll: (params?: any) => api.get('/laboratorije', { params }),
  getBySlug: (slug: string) => api.get(`/laboratorije/${slug}`),
  getAnalize: (id: number, params?: any) => api.get(`/laboratorije/${id}/analize`, { params }),
  getPaketi: (id: number) => api.get(`/laboratorije/${id}/paketi`),
  getByGrad: (grad: string, params?: any) => api.get(`/laboratorije/grad/${grad}`, { params }),
  getKategorije: () => api.get('/laboratorije/kategorije/all'),
  getGradovi: () => api.get('/laboratorije/gradovi/all'),
  getStatistics: () => api.get('/laboratorije/statistika/all'),
  searchAnalize: (params?: any) => api.get('/laboratorije/analize/search', { params }),
  getPopularneAnalize: () => api.get('/laboratorije/analize/popularne'),
  getAnalizenaAkciji: () => api.get('/laboratorije/analize/akcija'),
  
  // Dashboard routes (requires auth + laboratory role)
  getProfile: () => api.get('/laboratory/profile'),
  updateProfile: (data: any) => api.put('/laboratory/profile', data),
  getDashboardStatistics: () => api.get('/laboratory/statistics'),
  getDashboardAnalize: (params?: any) => api.get('/laboratory/analize', { params }),
  createAnaliza: (data: any) => api.post('/laboratory/analize', data),
  updateAnaliza: (id: number, data: any) => api.put(`/laboratory/analize/${id}`, data),
  deleteAnaliza: (id: number) => api.delete(`/laboratory/analize/${id}`),
  getDashboardPaketi: (params?: any) => api.get('/laboratory/paketi', { params }),
  createPaket: (data: any) => api.post('/laboratory/paketi', data),
  updatePaket: (id: number, data: any) => api.put(`/laboratory/paketi/${id}`, data),
  deletePaket: (id: number) => api.delete(`/laboratory/paketi/${id}`),
  getGalerija: () => api.get('/laboratory/galerija'),
  uploadGalerija: (data: any) => api.post('/laboratory/galerija', data),
  deleteGalerija: (id: number) => api.delete(`/laboratory/galerija/${id}`),
  getRadnoVrijeme: () => api.get('/laboratory/radno-vrijeme'),
  updateRadnoVrijeme: (data: any) => api.put('/laboratory/radno-vrijeme', data),
};

export const registrationAPI = {
  registerDoctor: (data: any) => api.post('/register/doctor', data),
  registerClinic: (data: any) => api.post('/register/clinic', data),
  registerLaboratory: (data: any) => api.post('/register/laboratory', data),
  registerSpa: (data: any) => api.post('/register/spa', data),
  registerCareHome: (data: any) => api.post('/register/care-home', data),
  verifyEmail: (token: string) => api.get(`/register/verify/${token}`),
  verifyEmailWithCode: (data: { email: string; code: string }) => api.post('/register/verify-code', data),
  resendVerification: (email: string) => api.post('/register/resend-verification', { email }),
  getSettings: () => api.get('/register/settings'),
};

export const spasAPI = {
  // Public routes
  getAll: (params?: any) => api.get('/banje', { params }),
  getBySlug: (slug: string) => api.get(`/banje/${slug}`),
  getPaketi: (id: number) => api.get(`/banje/${id}/paketi`),
  getRecenzije: (id: number, params?: any) => api.get(`/banje/${id}/recenzije`, { params }),
  getByGrad: (grad: string) => api.get(`/banje/grad/${grad}`),
  getFilterOptions: () => api.get('/banje/filter-options'),
  search: (params?: any) => api.get('/banje/search', { params }),
  
  // Public actions (rate limited)
  posaljiUpit: (id: number, data: any) => api.post(`/banje/${id}/upit`, data),
  dodajRecenziju: (id: number, data: any) => api.post(`/banje/${id}/recenzija`, data),
  
  // Dashboard routes (requires auth + spa_manager role)
  getMojaBanja: () => api.get('/banja/moja'),
  updateMojaBanja: (data: any) => api.put('/banja/moja', data),
  getStatistika: () => api.get('/banja/statistika'),
  toggleActive: () => api.post('/banja/toggle-active'),
  getUpiti: (params?: any) => api.get('/banja/upiti', { params }),
  oznacUpitProcitan: (id: number) => api.put(`/banja/upiti/${id}/procitan`),
  oznacUpitOdgovoren: (id: number) => api.put(`/banja/upiti/${id}/odgovoren`),
  zatvoriUpit: (id: number) => api.put(`/banja/upiti/${id}/zatvori`),
  getDashboardRecenzije: (params?: any) => api.get('/banja/recenzije', { params }),
  
  // Admin routes (requires auth + admin role)
  adminGetAll: (params?: any) => api.get('/admin/banje', { params }),
  adminCreate: (data: any) => api.post('/admin/banje', data),
  adminUpdate: (id: number, data: any) => api.put(`/admin/banje/${id}`, data),
  adminDelete: (id: number) => api.delete(`/admin/banje/${id}`),
  adminVerify: (id: number) => api.post(`/admin/banje/${id}/verify`),
  adminToggleActive: (id: number) => api.post(`/admin/banje/${id}/toggle-active`),
  adminGetDashboardStats: () => api.get('/admin/banje/statistika/dashboard'),
  adminGetAuditLog: (id: number, params?: any) => api.get(`/admin/banje/audit-log/${id}`, { params }),
  adminGetRecenzije: (params?: any) => api.get('/admin/banje/recenzije', { params }),
  adminOdobriRecenziju: (id: number) => api.post(`/admin/banje/recenzije/${id}/odobri`),
  adminOdbijRecenziju: (id: number) => api.delete(`/admin/banje/recenzije/${id}`),
  adminGetUpiti: (params?: any) => api.get('/admin/banje/upiti', { params }),
};

export const domoviAPI = {
  getAll: (params?: any) => api.get('/domovi-njega', { params }),
  getBySlug: (slug: string) => api.get(`/domovi-njega/${slug}`),
  getByGrad: (grad: string) => api.get('/domovi-njega', { params: { grad } }),
  getFilterOptions: () => api.get('/domovi-njega/filter-options'),
};


// Calendar Sync API
export const calendarSyncAPI = {
  getSettings: () => api.get('/doctor/calendar-sync'),
  updateSettings: (data: {
    enabled?: boolean;
    google_calendar_url?: string;
    outlook_calendar_url?: string;
  }) => api.put('/doctor/calendar-sync', data),
  regenerateToken: () => api.post('/doctor/calendar-sync/regenerate-token'),
};
