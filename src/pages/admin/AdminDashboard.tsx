import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Users, CheckCircle, FileText, BarChart3, UserCog } from "lucide-react";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    pendingVerifications: 0,
    pendingPolls: 0,
    totalUsers: 0,
    verifiedUsers: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

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

  return (
    <AdminLayout>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6 sm:mb-8">{t('admin.dashboard')}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                {t('admin.userManagement')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                {t('admin.manageUserRoles')}
              </p>
              <Button asChild className="w-full gradient-accent">
                <Link to="/admin/users" className="truncate">{t('admin.manageUsers')}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t('admin.verificationRequests')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                {t('admin.reviewVerifications')}
              </p>
              <Button asChild className="w-full gradient-accent">
                <Link to="/admin/verifications" className="truncate">{t('admin.viewRequests')}</Link>
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
              <p className="text-muted-foreground mb-4 text-sm">
                {t('admin.reviewPolls')}
              </p>
              <Button asChild className="w-full gradient-accent">
                <Link to="/admin/polls" className="truncate">{t('admin.viewPolls')}</Link>
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
              <p className="text-muted-foreground mb-4 text-sm">
                {t('admin.viewAnalytics')}
              </p>
              <Button asChild className="w-full gradient-accent">
                <Link to="/admin/analytics" className="truncate">View</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
