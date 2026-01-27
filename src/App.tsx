import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CookieConsent } from "@/components/CookieConsent";
import ErrorBoundary from "@/components/ErrorBoundary";
import { initSentry } from "@/config/sentry";
import { initGA, trackPageView } from "@/config/analytics";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorProfile from "./pages/DoctorProfile";
import CitySpecialtyDoctors from "./pages/CitySpecialtyDoctors";
import SpecialtyLanding from "./pages/SpecialtyLanding";
import CityLanding from "./pages/CityLanding";
import Cities from "./pages/Cities";
import Clinics from "./pages/Clinics";
import ClinicProfile from "./pages/ClinicProfile";
import ClinicDashboard from "./pages/ClinicDashboard";
import LaboratoryDashboard from "./pages/LaboratoryDashboard";
import SpaDashboard from "./pages/SpaDashboard";
import ClinicsBySpecialty from "./pages/ClinicsBySpecialty";
import Specialties from "./pages/Specialties";
import Doctors from "./pages/Doctors";
import DoctorsCompactList from "./pages/DoctorsCompactList";
import Laboratories from "./pages/Laboratories";
import LaboratoryProfile from "./pages/LaboratoryProfile";
import Spas from "./pages/Spas";
import SpaProfile from "./pages/SpaProfile";
import SpaIndikacije from "./pages/SpaIndikacije";
import Pitanja from "./pages/Pitanja";
import PitanjeDetalji from "./pages/PitanjeDetalji";
import PostaviPitanje from "./pages/PostaviPitanje";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BlogEditor from "./pages/BlogEditor";
import MyBlogPosts from "./pages/MyBlogPosts";
import MedicalCalendar from "./pages/MedicalCalendar";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import RegistrationOptions from "./pages/RegistrationOptions";
import RegisterDoctor from "./pages/RegisterDoctor";
import RegisterClinic from "./pages/RegisterClinic";
import RegisterLaboratory from "./pages/RegisterLaboratory";
import RegisterSpa from "./pages/RegisterSpa";
import CareHomes from "./pages/CareHomes";
import CareHomeProfile from "./pages/CareHomeProfile";
import CareHomeDashboard from "./pages/CareHomeDashboard";
import CareHomesVodic from "./pages/CareHomesVodic";
import RegisterCareHome from "./pages/RegisterCareHome";
import Mkb10 from "./pages/Mkb10";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import HealthCalculators from "./pages/HealthCalculators";
import CookiePolicy from "./pages/CookiePolicy";
import NotFound from "./pages/NotFound";

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
  // Initialize Sentry and Google Analytics on app load
  useEffect(() => {
    initSentry();
    initGA();
  }, []);

  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <PageViewTracker />
              <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/klinike" element={<Clinics />} />
              <Route path="/klinika/:slug" element={<ClinicProfile />} />
              <Route path="/klinike/specijalnost/:specijalnost" element={<ClinicsBySpecialty />} />
              <Route path="/klinike/:grad" element={<Clinics />} />
              <Route path="/klinike/:grad/:specijalnost" element={<Clinics />} />
              <Route path="/specijalnosti" element={<Specialties />} />
              <Route path="/doktori" element={<Doctors />} />
              <Route path="/doktori/lista" element={<DoctorsCompactList />} />
              <Route path="/doktor/:slug" element={<DoctorProfile />} />
              <Route path="/laboratorije" element={<Laboratories />} />
              <Route path="/laboratorija/:slug" element={<LaboratoryProfile />} />
              <Route path="/laboratorije/:grad" element={<Laboratories />} />
              
              <Route path="/banje" element={<Spas />} />
              <Route path="/banje/indikacije-terapije" element={<SpaIndikacije />} />
              <Route path="/banja/:slug" element={<SpaProfile />} />
              <Route path="/banje/:grad" element={<Spas />} />
              
              <Route path="/domovi-njega" element={<CareHomes />} />
              <Route path="/domovi-njega/vodic" element={<CareHomesVodic />} />
              <Route path="/dom-njega/:slug" element={<CareHomeProfile />} />
              <Route path="/domovi-njega/:grad" element={<CareHomes />} />
              <Route path="/mkb10" element={<Mkb10 />} />
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
              <Route path="/register/spa" element={<RegisterSpa />} />
              <Route path="/register/care-home" element={<RegisterCareHome />} />
              
              {/* Info pages */}
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/kalkulatori" element={<HealthCalculators />} />
              <Route path="/faq" element={<FAQ />} />
              
              {/* Legal pages */}
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/politika-privatnosti" element={<PrivacyPolicy />} />
              <Route path="/uslovi-koristenja" element={<TermsOfService />} />
              
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
              
              {/* Spa-only routes */}
              <Route path="/spa-dashboard" element={
                <ProtectedRoute allowedRoles={['spa_manager']}>
                  <SpaDashboard />
                </ProtectedRoute>
              } />
              
              {/* Care Home-only routes */}
              <Route path="/dom-dashboard" element={
                <ProtectedRoute allowedRoles={['dom_manager']}>
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
              <CookieConsent />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;
