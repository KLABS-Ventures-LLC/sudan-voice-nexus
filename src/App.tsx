import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Polls from "./pages/Polls";
import AdminDashboard from "./pages/admin/AdminDashboard";
import VerificationRequests from "./pages/admin/VerificationRequests";
import PollApprovals from "./pages/admin/PollApprovals";
import Analytics from "./pages/admin/Analytics";
import NotFound from "./pages/NotFound";
import "./i18n/config";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/polls" element={<Polls />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/verifications" element={<VerificationRequests />} />
          <Route path="/admin/polls" element={<PollApprovals />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
