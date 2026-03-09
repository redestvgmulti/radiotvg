import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import AudioEngine from "./components/AudioEngine";
import InAppBrowserBanner from "./components/InAppBrowserBanner";
import PersistentPlayer from "./components/PersistentPlayer";
import SignupPromoModal from "./components/SignupPromoModal";
import ListeningTracker from "./components/ListeningTracker";
import ErrorBoundary from "./components/ErrorBoundary";
import AdminLayout from "./components/AdminLayout";
import { Loader2 } from "lucide-react";

// Public pages
import AudioTab from "./pages/AudioTab";
import ProgramasTab from "./pages/ProgramasTab";
import PerfilTab from "./pages/PerfilTab";
import RewardsTab from "./pages/RewardsTab";
import ListenerLogin from "./pages/ListenerLogin";
import ListenerSignup from "./pages/ListenerSignup";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";

// Admin pages — lazy loaded
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminStreaming = lazy(() => import("./pages/AdminStreaming"));
const AdminAds = lazy(() => import("./pages/AdminAds"));
const AdminPrograms = lazy(() => import("./pages/AdminPrograms"));
const AdminRewards = lazy(() => import("./pages/AdminRewards"));
const AdminBoosters = lazy(() => import("./pages/AdminBoosters"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));

const queryClient = new QueryClient();

const AdminFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
  </div>
);

const AppLayout = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className={`min-h-screen bg-background ${isAdmin ? '' : 'max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto'} relative`}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<AudioTab />} />
        <Route path="/programas" element={<ProgramasTab />} />
        <Route path="/premios" element={<RewardsTab />} />
        <Route path="/perfil" element={<PerfilTab />} />
        <Route path="/login" element={<ListenerLogin />} />
        <Route path="/signup" element={<ListenerSignup />} />

        {/* Admin login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout><Suspense fallback={<AdminFallback />}><AdminDashboard /></Suspense></AdminLayout>} />
        <Route path="/admin/streaming" element={<AdminLayout><Suspense fallback={<AdminFallback />}><AdminStreaming /></Suspense></AdminLayout>} />
        <Route path="/admin/ads" element={<AdminLayout><Suspense fallback={<AdminFallback />}><AdminAds /></Suspense></AdminLayout>} />
        <Route path="/admin/programs" element={<AdminLayout><Suspense fallback={<AdminFallback />}><AdminPrograms /></Suspense></AdminLayout>} />
        <Route path="/admin/rewards" element={<AdminLayout><Suspense fallback={<AdminFallback />}><AdminRewards /></Suspense></AdminLayout>} />
        <Route path="/admin/boosters" element={<AdminLayout><Suspense fallback={<AdminFallback />}><AdminBoosters /></Suspense></AdminLayout>} />
        <Route path="/admin/users" element={<AdminLayout><Suspense fallback={<AdminFallback />}><AdminUsers /></Suspense></AdminLayout>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdmin && <PersistentPlayer />}
      {!isAdmin && <BottomNav />}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <BrowserRouter>
          <InAppBrowserBanner />
          <AudioEngine />
          <SignupPromoModal />
          <ListeningTracker />
          <AppLayout />
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
