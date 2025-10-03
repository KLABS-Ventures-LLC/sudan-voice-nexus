import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <SidebarProvider>
        <div className="flex-1 flex w-full">
          <AdminSidebar />
          
          <div className="flex-1 flex flex-col min-w-0">
            <div className="border-b p-2">
              <SidebarTrigger />
            </div>
            
            <main className="flex-1 container py-6 sm:py-12 px-4">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>

      <Footer />
    </div>
  );
}
