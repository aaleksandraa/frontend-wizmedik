import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { BrowserRouter, Navigate, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CookieConsent } from "@/components/CookieConsent";
import { ScrollToTop } from "@/components/ScrollToTop";
import ErrorBoundary from "@/components/ErrorBoundary";
import { trackPageView } from "@/config/analytics";
import { Loader2 } from "lucide-react";

// Core entry pages - keep initial bundle lean
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";

// Route-level lazy loading keeps non-critical code out of the initial bundle.
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CitySpecialtyDoctors = lazy(() => import("./pages/CitySpecialtyDoctors"));
const SpecialtyLanding = lazy(() => import("./pages/SpecialtyLanding"));
const SpecialtyServicePage = lazy(() => import("./pages/SpecialtyServicePage"));
const CityLanding = lazy(() => import("./pages/CityLanding"));
const Cities = lazy(() => import("./pages/Cities"));
const Clinics = lazy(() => import("./pages/Clinics"));
const ClinicProfile = lazy(() => import("./pages/ClinicProfile"));
const Specialties = lazy(() => import("./pages/Specialties"));
const Doctors = lazy(() => import("./pages/Doctors"));
const DoctorsCompactList = lazy(() => import("./pages/DoctorsCompactList"));
const Laboratories = lazy(() => import("./pages/Laboratories"));
const LaboratoryProfile = lazy(() => import("./pages/LaboratoryProfile"));
const Pharmacies = lazy(() => import("./pages/Pharmacies"));
const Spas = lazy(() => import("./pages/Spas"));
const SpaProfile = lazy(() => import("./pages/SpaProfile"));
const SpaIndikacije = lazy(() => import("./pages/SpaIndikacije"));
const Pitanja = lazy(() => import("./pages/Pitanja"));
const PitanjeDetalji = lazy(() => import("./pages/PitanjeDetalji"));
const PostaviPitanje = lazy(() => import("./pages/PostaviPitanje"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const RegistrationOptions = lazy(() => import("./pages/RegistrationOptions"));
const RegisterDoctor = lazy(() => import("./pages/RegisterDoctor"));
const RegisterClinic = lazy(() => import("./pages/RegisterClinic"));
const RegisterLaboratory = lazy(() => import("./pages/RegisterLaboratory"));
const RegisterPharmacy = lazy(() => import("./pages/RegisterPharmacy"));
const RegisterSpa = lazy(() => import("./pages/RegisterSpa"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const CareHomes = lazy(() => import("./pages/CareHomes"));
const CareHomeProfile = lazy(() => import("./pages/CareHomeProfile"));
const CareHomeDashboard = lazy(() => import("./pages/CareHomeDashboard"));
const CareHomesVodic = lazy(() => import("./pages/CareHomesVodic"));
const RegisterCareHome = lazy(() => import("./pages/RegisterCareHome"));
const Mkb10 = lazy(() => import("./pages/Mkb10"));
const Lijekovi = lazy(() => import("./pages/Lijekovi"));
const LijekProfil = lazy(() => import("./pages/LijekProfil"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const HealthCalculators = lazy(() => import("./pages/HealthCalculators"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const Impressum = lazy(() => import("./pages/Impressum"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const DoctorDashboard = lazy(() => import("./pages/DoctorDashboard"));
const DoctorProfile = lazy(() => import("./pages/DoctorProfile"));
const ClinicDashboard = lazy(() => import("./pages/ClinicDashboard"));
const LaboratoryDashboard = lazy(() => import("./pages/LaboratoryDashboard"));
const PharmacyProfile = lazy(() => import("./pages/PharmacyProfile"));
const PharmacyDashboard = lazy(() => import("./pages/PharmacyDashboard"));
const SpaDashboard = lazy(() => import("./pages/SpaDashboard"));
const BlogEditor = lazy(() => import("./pages/BlogEditor"));
const MyBlogPosts = lazy(() => import("./pages/MyBlogPosts"));
const MedicalCalendar = lazy(() => import("./pages/MedicalCalendar"));

// Loading component for lazy-loaded pages
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Component to track page views
const PageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    trackPageView(location.pathname + location.search, document.title);
  }, [location]);

  return null;
};

const App = () => {
  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <CookieConsentProvider>
              <PageViewTracker />
              <ScrollToTop />
              <Suspense fallback={<PageLoader />}>
              <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/klinike" element={<Clinics />} />
              <Route path="/klinike/specijalnost/:specijalnost" element={<Clinics />} />
              <Route path="/klinike/:grad/:specijalnost" element={<Clinics />} />
              <Route path="/klinike/:grad" element={<Clinics />} />
              <Route path="/klinika/:slug" element={<ClinicProfile />} />
              <Route path="/specijalnosti" element={<Specialties />} />
              <Route path="/doktori" element={<Doctors />} />
              <Route path="/doktori/lista" element={<DoctorsCompactList />} />
              <Route path="/doktor/:slug" element={<DoctorProfile />} />
              <Route path="/laboratorije" element={<Laboratories />} />
              <Route path="/laboratorije/:grad" element={<Laboratories />} />
              <Route path="/laboratorija/:slug" element={<LaboratoryProfile />} />
              <Route path="/apoteke" element={<Pharmacies />} />
              <Route path="/apoteke/:grad" element={<Pharmacies />} />
              <Route path="/apoteka/:slug" element={<PharmacyProfile />} />
              
              <Route path="/banje" element={<Spas />} />
              <Route path="/banje/:grad" element={<Spas />} />
              <Route path="/banje/indikacije-terapije" element={<SpaIndikacije />} />
              <Route path="/banja/:slug" element={<SpaProfile />} />
              
              <Route path="/domovi-njega" element={<CareHomes />} />
              <Route path="/domovi-njega/:grad" element={<CareHomes />} />
              <Route path="/domovi-njega/vodic" element={<CareHomesVodic />} />
              <Route path="/dom-njega/:slug" element={<CareHomeProfile />} />
              <Route path="/mkb10" element={<Mkb10 />} />
              <Route path="/lijekovi" element={<Lijekovi />} />
              <Route path="/lijekovi/:slug" element={<LijekProfil />} />
              <Route path="/specijalnost/:specijalnost/:usluga" element={<SpecialtyServicePage />} />
              <Route path="/specijalnost/:naziv" element={<SpecialtyLanding />} />
              <Route path="/gradovi" element={<Cities />} />
              <Route path="/grad/:grad" element={<CityLanding />} />
              <Route path="/doktori/:grad/:specijalnost" element={<CitySpecialtyDoctors />} />
              <Route path="/doktori/:grad" element={<CitySpecialtyDoctors />} />
              <Route path="/doktori/specijalnost/:specijalnost" element={<CitySpecialtyDoctors />} />
              
              {/* Pitanja routes */}
              <Route path="/pitanja" element={<Pitanja />} />
              <Route path="/pitanja/:slug" element={<PitanjeDetalji />} />
              <Route path="/postavi-pitanje" element={<PostaviPitanje />} />
              
              {/* Blog routes */}
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              
              {/* Medical Calendar */}
              <Route path="/medicinski-kalendar" element={<MedicalCalendar />} />
              
              {/* Blog Management */}
              <Route path="/my-blog-posts" element={
                <ProtectedRoute>
                  <MyBlogPosts />
                </ProtectedRoute>
              } />
              
              {/* Blog Editor - Admin & Doctors */}
              <Route path="/blog/editor" element={
                <ProtectedRoute>
                  <BlogEditor />
                </ProtectedRoute>
              } />
              <Route path="/blog/editor/:slug" element={
                <ProtectedRoute>
                  <BlogEditor />
                </ProtectedRoute>
              } />
              
              {/* Registration pages */}
              <Route path="/registration-options" element={<RegistrationOptions />} />
              <Route path="/register/doctor" element={<RegisterDoctor />} />
              <Route path="/register/clinic" element={<RegisterClinic />} />
              <Route path="/register/laboratory" element={<RegisterLaboratory />} />
              <Route path="/register/pharmacy" element={<RegisterPharmacy />} />
              <Route path="/register/spa" element={<RegisterSpa />} />
              <Route path="/register/care-home" element={<RegisterCareHome />} />
              <Route path="/register/verify/:token" element={<VerifyEmail />} />
              
              {/* Info pages */}
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/o-nama" element={<Navigate to="/about" replace />} />
              <Route path="/kontakt" element={<Navigate to="/contact" replace />} />
              <Route path="/kalkulatori" element={<HealthCalculators />} />
              <Route path="/faq" element={<FAQ />} />
              
              {/* Legal pages */}
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/politika-privatnosti" element={<PrivacyPolicy />} />
              <Route path="/uslovi-koristenja" element={<TermsOfService />} />
              <Route path="/impressum" element={<Impressum />} />
              
              {/* Protected routes - require authentication */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* Doctor-only routes */}
              <Route path="/doctor-dashboard" element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } />
              
              {/* Clinic-only routes */}
              <Route path="/clinic-dashboard" element={
                <ProtectedRoute allowedRoles={['clinic']}>
                  <ClinicDashboard />
                </ProtectedRoute>
              } />
              
              {/* Laboratory-only routes */}
              <Route path="/laboratory-dashboard" element={
                <ProtectedRoute allowedRoles={['laboratory']}>
                  <LaboratoryDashboard />
                </ProtectedRoute>
              } />

              {/* Pharmacy-only routes */}
              <Route path="/pharmacy-dashboard" element={
                <ProtectedRoute allowedRoles={['pharmacy_owner']}>
                  <PharmacyDashboard />
                </ProtectedRoute>
              } />
              
              {/* Spa-only routes */}
              <Route path="/spa-dashboard" element={
                <ProtectedRoute allowedRoles={['spa_manager', 'spa']}>
                  <SpaDashboard />
                </ProtectedRoute>
              } />
              
              {/* Care Home-only routes */}
              <Route path="/dom-dashboard" element={
                <ProtectedRoute allowedRoles={['dom_manager', 'care_home_manager', 'care_home']}>
                  <CareHomeDashboard />
                </ProtectedRoute>
              } />
              
              {/* Admin-only routes */}
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPanel />
                </ProtectedRoute>
              } />
              <Route path="/admin/*" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPanel />
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
              <CookieConsent />
              </CookieConsentProvider>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;
