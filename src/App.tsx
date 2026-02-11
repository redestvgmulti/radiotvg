import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import AudioTab from "./pages/AudioTab";
import VideoTab from "./pages/VideoTab";
import ProgramasTab from "./pages/ProgramasTab";
import PerfilTab from "./pages/PerfilTab";
import ConfigTab from "./pages/ConfigTab";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminStreaming from "./pages/AdminStreaming";
import AdminUsers from "./pages/AdminUsers";
import AdminStats from "./pages/AdminStats";
import AdminConfig from "./pages/AdminConfig";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppLayout = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className={`min-h-screen bg-background ${isAdmin ? '' : 'max-w-lg mx-auto'} relative`}>
      <Routes>
        <Route path="/" element={<AudioTab />} />
        <Route path="/video" element={<VideoTab />} />
        <Route path="/programas" element={<ProgramasTab />} />
        <Route path="/perfil" element={<PerfilTab />} />
        <Route path="/config" element={<ConfigTab />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/streaming" element={<AdminStreaming />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/stats" element={<AdminStats />} />
        <Route path="/admin/config" element={<AdminConfig />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdmin && <BottomNav />}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
