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
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="gradient-hero p-2 rounded-lg">
            <Vote className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold">Sudan Voice Nexus</span>
        </Link>

        <nav className="flex items-center gap-2">
          <LanguageSwitch />
          <Button variant="ghost" asChild>
            <Link to="/polls">{t('nav.polls')}</Link>
          </Button>
          
          {user ? (
            <>
              <Button variant="ghost" asChild>
                <Link to="/profile">
                  <User className="h-4 w-4 mr-2" />
                  {t('nav.profile')}
                </Link>
              </Button>
              
              {isAdmin && (
                <Button variant="ghost" asChild>
                  <Link to="/admin">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    {t('nav.admin')}
                  </Link>
                </Button>
              )}
              
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                {t('nav.signOut')}
              </Button>
            </>
          ) : (
            <Button asChild className="gradient-hero">
              <Link to="/auth">{t('nav.signIn')}</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};
