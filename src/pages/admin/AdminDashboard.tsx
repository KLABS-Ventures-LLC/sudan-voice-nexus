import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Users, CheckCircle, FileText, BarChart3 } from "lucide-react";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    pendingVerifications: 0,
    pendingPolls: 0,
    totalUsers: 0,
    verifiedUsers: 0
  });

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Temporarily disabled admin check for testing
    // const { data } = await supabase.rpc('is_admin', { _user_id: session.user.id });
    // if (!data) {
    //   navigate("/");
    //   return;
    // }

    setIsAdmin(true);
    fetchStats();
  };

  const fetchStats = async () => {
    const [verifications, polls, users, verified] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact' }).eq('verification_status', 'pending'),
      supabase.from('polls').select('id', { count: 'exact' }).eq('approved', false),
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('profiles').select('id', { count: 'exact' }).eq('verification_status', 'verified')
    ]);

    setStats({
      pendingVerifications: verifications.count || 0,
      pendingPolls: polls.count || 0,
      totalUsers: users.count || 0,
      verifiedUsers: verified.count || 0
    });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 container py-12">
        <h1 className="text-5xl font-extrabold mb-8">{t('admin.dashboard')}</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.totalUsers')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.verifiedUsers')}</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verifiedUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.pendingVerifications')}</CardTitle>
              <Users className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.pendingPolls')}</CardTitle>
              <FileText className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingPolls}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t('admin.verificationRequests')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t('admin.reviewVerifications')}
              </p>
              <Button asChild className="w-full gradient-accent">
                <Link to="/admin/verifications">{t('admin.viewRequests')}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('admin.pollApprovals')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t('admin.reviewPolls')}
              </p>
              <Button asChild className="w-full gradient-accent">
                <Link to="/admin/polls">{t('admin.viewPolls')}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t('admin.analytics')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t('admin.viewAnalytics')}
              </p>
              <Button asChild className="w-full gradient-accent">
                <Link to="/admin/analytics">{t('admin.viewAnalytics')}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
