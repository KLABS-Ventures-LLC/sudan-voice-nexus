import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, ShieldOff, Search } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  verification_status: string;
}

interface UserRole {
  user_id: string;
  role: string;
}

const Users = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<Map<string, string[]>>(new Map());
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchUserRoles();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, verification_status')
      .order('full_name');

    if (error) {
      toast.error("Failed to fetch users");
      return;
    }

    setUsers(data || []);
  };

  const fetchUserRoles = async () => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (error) {
      toast.error("Failed to fetch user roles");
      return;
    }

    const rolesMap = new Map<string, string[]>();
    (data || []).forEach((ur: UserRole) => {
      const roles = rolesMap.get(ur.user_id) || [];
      roles.push(ur.role);
      rolesMap.set(ur.user_id, roles);
    });

    setUserRoles(rolesMap);
  };

  const toggleAdminRole = async (userId: string, currentlyAdmin: boolean) => {
    if (currentlyAdmin) {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) {
        toast.error("Failed to remove admin role");
        return;
      }
      toast.success("Admin role removed");
    } else {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'admin' });

      if (error) {
        toast.error("Failed to grant admin role");
        return;
      }
      toast.success("Admin role granted");
    }

    fetchUserRoles();
  };

  const isAdmin = (userId: string) => {
    return userRoles.get(userId)?.includes('admin') || false;
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6 sm:mb-8">{t('admin.userManagement')}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <span className="text-xl sm:text-2xl">{t('admin.allUsers')}</span>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('admin.searchUsers')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">{t('common.name')}</TableHead>
                <TableHead className="min-w-[200px]">{t('common.email')}</TableHead>
                <TableHead className="min-w-[120px]">{t('common.phone')}</TableHead>
                <TableHead className="min-w-[100px]">{t('profile.status')}</TableHead>
                <TableHead className="min-w-[100px]">{t('admin.role')}</TableHead>
                <TableHead className="text-right min-w-[150px]">{t('admin.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Badge variant={user.verification_status === 'verified' ? 'default' : 'secondary'}>
                      {t(`profile.${user.verification_status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isAdmin(user.id) && (
                      <Badge className="bg-primary">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={isAdmin(user.id) ? "destructive" : "default"}
                      onClick={() => toggleAdminRole(user.id, isAdmin(user.id))}
                    >
                      {isAdmin(user.id) ? (
                        <>
                          <ShieldOff className="h-4 w-4 mr-1" />
                          {t('admin.removeAdmin')}
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-1" />
                          {t('admin.makeAdmin')}
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default Users;
