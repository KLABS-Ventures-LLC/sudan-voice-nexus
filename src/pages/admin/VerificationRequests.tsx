import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, XCircle, ExternalLink } from "lucide-react";

const VerificationRequests = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
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

    fetchRequests();
  };

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('verification_status', 'pending')
      .order('updated_at', { ascending: false });

    if (data) {
      setRequests(data);
    }
  };

  const handleApprove = async (profileId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        verification_status: 'verified',
        verification_notes: notes[profileId] || null
      })
      .eq('id', profileId);

    if (error) {
      toast.error(t('admin.approveFailed'));
    } else {
      toast.success(t('admin.approveSuccess'));
      fetchRequests();
    }
  };

  const handleReject = async (profileId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        verification_status: 'rejected',
        verification_notes: notes[profileId] || null
      })
      .eq('id', profileId);

    if (error) {
      toast.error(t('admin.rejectFailed'));
    } else {
      toast.success(t('admin.rejectSuccess'));
      fetchRequests();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 container py-12">
        <h1 className="text-5xl font-extrabold mb-8">{t('admin.verificationRequests')}</h1>

        {requests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">{t('admin.noPendingVerifications')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{request.full_name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{request.email}</p>
                    </div>
                    <Badge variant="default">{t('profile.pending')}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">{t('common.phone')}</p>
                      <p className="text-muted-foreground">{request.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t('common.location')}</p>
                      <p className="text-muted-foreground">{request.location || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t('common.occupation')}</p>
                      <p className="text-muted-foreground">{request.occupation || '-'}</p>
                    </div>
                  </div>

                  {request.headshot_url && (
                    <div>
                      <p className="text-sm font-medium mb-2">{t('common.headshot')}</p>
                      <img src={request.headshot_url} alt="Headshot" className="w-32 h-32 object-cover rounded-lg" />
                    </div>
                  )}

                  {request.passport_url && (
                    <div>
                      <p className="text-sm font-medium mb-2">{t('common.passport')}</p>
                      <a 
                        href={request.passport_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline"
                      >
                        {t('admin.viewDocument')}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium mb-2">{t('admin.notes')}</p>
                    <Textarea
                      value={notes[request.id] || ''}
                      onChange={(e) => setNotes({ ...notes, [request.id]: e.target.value })}
                      placeholder={t('admin.notesPlaceholder')}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleApprove(request.id)}
                      className="flex-1 bg-success hover:bg-success/90"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {t('admin.approve')}
                    </Button>
                    <Button 
                      onClick={() => handleReject(request.id)}
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

export default VerificationRequests;
