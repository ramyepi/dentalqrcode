
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import Index from "./pages/Index";
import QRScan from "./pages/QRScan";
import LicenseCheck from "./pages/LicenseCheck";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import ClinicManagement from "./components/ClinicManagement";
import SpecializationManagement from "./components/SpecializationManagement";
import SiteSettingsManagement from "./components/SiteSettingsManagement";
import AnalyticsReport from "./components/AnalyticsReport";
import QRScanner from "./components/QRScanner";
import GeographyManagement from "./pages/GeographyManagement";
import PrintCustomization from './pages/PrintCustomization';
import PrintQR from './pages/PrintQR';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (failureCount < 3 && navigator.onLine !== false) {
          return true;
        }
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 30000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: (failureCount, error) => {
        if (failureCount < 2 && navigator.onLine !== false) {
          return true;
        }
        return false;
      },
      retryDelay: 1000,
    },
  },
});

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

const NavBar: React.FC = () => (
  <nav className="bg-white border-b border-gray-200 px-4 py-2 flex gap-4 items-center">
    <a href="/" className="text-blue-600 font-semibold hover:underline">الرئيسية</a>
    <a href="/license-check" className="text-blue-600 font-semibold hover:underline">التحقق من الترخيص</a>
    <a href="/qr-scan" className="text-blue-600 font-semibold hover:underline">مسح QR</a>
    <a href="/admin" className="text-blue-600 font-semibold hover:underline">دخول الإدارة</a>
  </nav>
);

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen w-full">
      <TooltipProvider>
        <BrowserRouter>
          <NavBar />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/qr-scan" element={<QRScan />} />
              <Route path="/license-check" element={<LicenseCheck />} />
              <Route path="/admin" element={<Admin />}>
                <Route path="clinic-management" element={<ClinicManagement />} />
                <Route path="specialization-management" element={<SpecializationManagement />} />
                <Route path="geography-management" element={<GeographyManagement />} />
                <Route path="site-settings" element={<SiteSettingsManagement />} />
                <Route path="analytics-report" element={<AnalyticsReport />} />
                <Route path="qr-scan" element={<QRScan />} />
                <Route path="print-customization" element={<PrintCustomization />} />
                <Route path="print-qr" element={<PrintQR />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseProvider>
        <AppContent />
      </SupabaseProvider>
    </QueryClientProvider>
  );
};

export default App;
