import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";

const PollApprovals = () => {
  const { t } = useTranslation();
  const [polls, setPolls] = useState<any[]>([]);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    const { data } = await supabase
      .from('polls')
      .select('*, profiles(full_name)')
      .eq('approved', false)
      .order('created_at', { ascending: false });

    if (data) {
      setPolls(data);
    }
  };

  const handleApprove = async (pollId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('polls')
      .update({
        approved: true,
        approved_by: session.user.id
      })
      .eq('id', pollId);

    if (error) {
      toast.error(t('admin.pollApproveFailed'));
    } else {
      toast.success(t('admin.pollApproveSuccess'));
      fetchPolls();
    }
  };

  const handleReject = async (pollId: string) => {
    const { error } = await supabase
      .from('polls')
      .update({
        is_active: false
      })
      .eq('id', pollId);

    if (error) {
      toast.error(t('admin.pollRejectFailed'));
    } else {
      toast.success(t('admin.pollRejectSuccess'));
      fetchPolls();
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-5xl font-extrabold mb-8">{t('admin.pollApprovals')}</h1>

        {polls.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">{t('admin.noPendingPolls')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {polls.map((poll) => (
              <Card key={poll.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-2xl">{poll.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('admin.createdBy')}: {poll.profiles?.full_name}
                      </p>
                    </div>
                    <Badge variant="default">{t(`poll.categories.${poll.category}`)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {poll.description && (
                    <div>
                      <p className="text-sm font-medium">{t('poll.description')}</p>
                      <p className="text-muted-foreground">{poll.description}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleApprove(poll.id)}
                      className="flex-1 bg-success hover:bg-success/90"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {t('admin.approve')}
                    </Button>
                    <Button 
                      onClick={() => handleReject(poll.id)}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      {t('admin.reject')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </AdminLayout>
  );
};

export default PollApprovals;
