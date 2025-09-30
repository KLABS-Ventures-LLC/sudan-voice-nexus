import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";

const PollApprovals = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [polls, setPolls] = useState<any[]>([]);

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data } = await supabase.rpc('is_admin', { _user_id: session.user.id });
    if (!data) {
      navigate("/");
      return;
    }

    fetchPolls();
  };

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
      toast.error("Failed to approve poll");
    } else {
      toast.success("Poll approved successfully!");
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
      toast.error("Failed to reject poll");
    } else {
      toast.success("Poll rejected");
      fetchPolls();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 container py-12">
        <h1 className="text-5xl font-extrabold mb-8">{t('admin.pollApprovals')}</h1>

        {polls.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No pending poll approvals</p>
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
                        Created by: {poll.profiles?.full_name}
                      </p>
                    </div>
                    <Badge variant="default">{t(`poll.categories.${poll.category}`)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {poll.description && (
                    <div>
                      <p className="text-sm font-medium">Description</p>
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
      </div>

      <Footer />
    </div>
  );
};

export default PollApprovals;
