import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [occupation, setOccupation] = useState("");
  const [headshotFile, setHeadshotFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUserId(session.user.id);
    setEmail(session.user.email || "");
  };

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('profiles')
      .upload(path, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(path);
    
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);

    try {
      let headshotUrl = "";
      let passportUrl = "";

      if (headshotFile) {
        headshotUrl = await uploadFile(headshotFile, `${userId}/headshot-${Date.now()}`);
      }

      if (passportFile) {
        passportUrl = await uploadFile(passportFile, `${userId}/passport-${Date.now()}`);
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone,
          location,
          occupation,
          headshot_url: headshotUrl || null,
          passport_url: passportUrl || null,
          verification_status: passportUrl ? 'pending' : 'unverified'
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      navigate("/profile");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} disabled />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input id="occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="headshot">Headshot Picture *</Label>
                <Input id="headshot" type="file" accept="image/*" onChange={(e) => setHeadshotFile(e.target.files?.[0] || null)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passport">Passport/ID (Optional - for verification)</Label>
                <Input id="passport" type="file" accept="image/*,application/pdf" onChange={(e) => setPassportFile(e.target.files?.[0] || null)} />
              </div>

              <Button type="submit" className="w-full gradient-hero" disabled={loading}>
                {loading ? "Saving..." : "Complete Registration"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
