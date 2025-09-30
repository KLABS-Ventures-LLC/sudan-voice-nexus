import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload } from "lucide-react";

const Profile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (data) {
      setProfile(data);
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const { error } = await supabase.storage
      .from('profiles')
      .upload(path, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(path);
    
    return publicUrl;
  };

  const handleUpgradeVerification = async () => {
    if (!passportFile || !profile) return;

    setLoading(true);

    try {
      const passportUrl = await uploadFile(passportFile, `${profile.id}/passport-${Date.now()}`);

      const { error } = await supabase
        .from('profiles')
        .update({
          passport_url: passportUrl,
          verification_status: 'pending'
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success("Verification request submitted!");
      fetchProfile();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit verification");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      unverified: "secondary",
      pending: "default",
      verified: "default",
      rejected: "destructive"
    };

    const colors: any = {
      verified: "bg-success text-success-foreground"
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {t(`profile.${status}`)}
      </Badge>
    );
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-3xl">{t('profile.title')}</CardTitle>
              {getStatusBadge(profile.verification_status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>{t('register.fullName')}</Label>
                <p className="text-lg font-medium">{profile.full_name}</p>
              </div>
              <div>
                <Label>{t('register.phone')}</Label>
                <p className="text-lg font-medium">{profile.phone}</p>
              </div>
            </div>

            <div>
              <Label>{t('register.email')}</Label>
              <p className="text-lg font-medium">{profile.email}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>{t('register.location')}</Label>
                <p className="text-lg font-medium">{profile.location || '-'}</p>
              </div>
              <div>
                <Label>{t('register.occupation')}</Label>
                <p className="text-lg font-medium">{profile.occupation || '-'}</p>
              </div>
            </div>

            {profile.headshot_url && (
              <div>
                <Label>{t('register.headshot')}</Label>
                <img src={profile.headshot_url} alt="Headshot" className="mt-2 w-32 h-32 object-cover rounded-lg" />
              </div>
            )}

            {profile.verification_status === 'unverified' && !profile.passport_url && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-xl">{t('profile.upgrade')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {t('profile.upgradeDescription')}
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="passport">{t('profile.uploadPassport')}</Label>
                    <Input 
                      id="passport" 
                      type="file" 
                      accept="image/*,application/pdf" 
                      onChange={(e) => setPassportFile(e.target.files?.[0] || null)} 
                    />
                  </div>
                  <Button 
                    onClick={handleUpgradeVerification} 
                    disabled={!passportFile || loading}
                    className="w-full gradient-accent"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {loading ? t('profile.submitting') : t('profile.submitVerification')}
                  </Button>
                </CardContent>
              </Card>
            )}

            {profile.verification_notes && (
              <div className="space-y-2">
                <Label>{t('profile.verificationNotes')}</Label>
                <p className="text-sm text-muted-foreground">{profile.verification_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
