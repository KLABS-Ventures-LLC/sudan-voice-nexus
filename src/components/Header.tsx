import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Vote, LogOut, User, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LanguageSwitch } from "./LanguageSwitch";

export const Header = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    setIsAdmin(!!data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="gradient-hero p-2 rounded-lg">
            <Vote className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <span className="text-base sm:text-xl font-bold hidden sm:inline">Sudan Voice Nexus</span>
          <span className="text-sm font-bold sm:hidden">SVN</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitch />
          <Button variant="ghost" size="sm" asChild className="hidden md:flex">
            <Link to="/polls">{t('nav.polls')}</Link>
          </Button>
          
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                <Link to="/profile">
                  <User className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t('nav.profile')}</span>
                </Link>
              </Button>
              
              <Button variant="ghost" size="sm" asChild className="sm:hidden">
                <Link to="/profile">
                  <User className="h-4 w-4" />
                </Link>
              </Button>
              
              {isAdmin && (
                <>
                  <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                    <Link to="/admin">
                      <LayoutDashboard className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">{t('nav.admin')}</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="sm:hidden">
                    <Link to="/admin">
                      <LayoutDashboard className="h-4 w-4" />
                    </Link>
                  </Button>
                </>
              )}
              
              <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden sm:flex">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{t('nav.signOut')}</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="sm:hidden">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="gradient-hero text-xs sm:text-sm">
              <Link to="/auth">{t('nav.signIn')}</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};
