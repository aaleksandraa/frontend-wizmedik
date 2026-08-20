import React, { Suspense, useEffect } from "react";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { BrowserRouter, Navigate, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { AdSenseProvider } from "@/contexts/AdSenseContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CookieConsent } from "@/components/CookieConsent";
import { AdSenseLoader } from "@/components/AdSenseLoader";
import { ScrollToTop } from "@/components/ScrollToTop";
import ErrorBoundary from "@/components/ErrorBoundary";
import { trackPageView } from "@/config/analytics";
import { trackClarityPageView } from "@/config/clarity";
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
const Dashboard = lazyWithRetry(() => import("./pages/Dashboard"));
const CitySpecialtyDoctors = lazyWithRetry(() => import("./pages/CitySpecialtyDoctors"));
const SpecialtyLanding = lazyWithRetry(() => import("./pages/SpecialtyLanding"));
const SpecialtyServicePage = lazyWithRetry(() => import("./pages/SpecialtyServicePage"));
const CityLanding = lazyWithRetry(() => import("./pages/CityLanding"));
const Cities = lazyWithRetry(() => import("./pages/Cities"));
const Clinics = lazyWithRetry(() => import("./pages/Clinics"));
const ClinicProfile = lazyWithRetry(() => import("./pages/ClinicProfile"));
const Specialties = lazyWithRetry(() => import("./pages/Specialties"));
const Doctors = lazyWithRetry(() => import("./pages/Doctors"));
const DoctorsCompactList = lazyWithRetry(() => import("./pages/DoctorsCompactList"));
const Laboratories = lazyWithRetry(() => import("./pages/Laboratories"));
const LaboratoryProfile = lazyWithRetry(() => import("./pages/LaboratoryProfile"));
const Pharmacies = lazyWithRetry(() => import("./pages/Pharmacies"));
const Spas = lazyWithRetry(() => import("./pages/Spas"));
const SpaProfile = lazyWithRetry(() => import("./pages/SpaProfile"));
const SpaIndikacije = lazyWithRetry(() => import("./pages/SpaIndikacije"));
const Pitanja = lazyWithRetry(() => import("./pages/Pitanja"));
const PitanjeDetalji = lazyWithRetry(() => import("./pages/PitanjeDetalji"));
const PostaviPitanje = lazyWithRetry(() => import("./pages/PostaviPitanje"));
const Blog = lazyWithRetry(() => import("./pages/Blog"));
const BlogPost = lazyWithRetry(() => import("./pages/BlogPost"));
const RegistrationOptions = lazyWithRetry(() => import("./pages/RegistrationOptions"));
const RegisterDoctor = lazyWithRetry(() => import("./pages/RegisterDoctor"));
const RegisterClinic = lazyWithRetry(() => import("./pages/RegisterClinic"));
const RegisterLaboratory = lazyWithRetry(() => import("./pages/RegisterLaboratory"));
const RegisterPharmacy = lazyWithRetry(() => import("./pages/RegisterPharmacy"));
const RegisterSpa = lazyWithRetry(() => import("./pages/RegisterSpa"));
const VerifyEmail = lazyWithRetry(() => import("./pages/VerifyEmail"));
const CareHomes = lazyWithRetry(() => import("./pages/CareHomes"));
const CareHomeProfile = lazyWithRetry(() => import("./pages/CareHomeProfile"));
const CareHomeDashboard = lazyWithRetry(() => import("./pages/CareHomeDashboard"));
const CareHomesVodic = lazyWithRetry(() => import("./pages/CareHomesVodic"));
const RegisterCareHome = lazyWithRetry(() => import("./pages/RegisterCareHome"));
const Mkb10 = lazyWithRetry(() => import("./pages/Mkb10"));
const Lijekovi = lazyWithRetry(() => import("./pages/Lijekovi"));
const LijekProfil = lazyWithRetry(() => import("./pages/LijekProfil"));
const About = lazyWithRetry(() => import("./pages/About"));
const Contact = lazyWithRetry(() => import("./pages/Contact"));
const FAQ = lazyWithRetry(() => import("./pages/FAQ"));
const HealthCalculators = lazyWithRetry(() => import("./pages/HealthCalculators"));
const CookiePolicy = lazyWithRetry(() => import("./pages/CookiePolicy"));
const Impressum = lazyWithRetry(() => import("./pages/Impressum"));
const AdminPanel = lazyWithRetry(() => import("./pages/AdminPanel"));
const DoctorDashboard = lazyWithRetry(() => import("./pages/DoctorDashboard"));
const DoctorProfile = lazyWithRetry(() => import("./pages/DoctorProfile"));
const ClinicDashboard = lazyWithRetry(() => import("./pages/ClinicDashboard"));
const LaboratoryDashboard = lazyWithRetry(() => import("./pages/LaboratoryDashboard"));
const PharmacyProfile = lazyWithRetry(() => import("./pages/PharmacyProfile"));
const PharmacyDashboard = lazyWithRetry(() => import("./pages/PharmacyDashboard"));
const SpaDashboard = lazyWithRetry(() => import("./pages/SpaDashboard"));
const BlogEditor = lazyWithRetry(() => import("./pages/BlogEditor"));
const MyBlogPosts = lazyWithRetry(() => import("./pages/MyBlogPosts"));
const MedicalCalendar = lazyWithRetry(() => import("./pages/MedicalCalendar"));

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
    trackClarityPageView(location.pathname + location.search);
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
              <AdSenseProvider>
              <PageViewTracker />
              <ScrollToTop />
              <AdSenseLoader />
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
              </AdSenseProvider>
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
