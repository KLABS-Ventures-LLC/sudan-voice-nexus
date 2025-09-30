import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const EmailSubscribe = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('email_subscribers')
      .insert({ email });

    setLoading(false);

    if (error) {
      if (error.code === '23505') {
        toast.error("This email is already subscribed");
      } else {
        toast.error("Failed to subscribe");
      }
    } else {
      toast.success("Successfully subscribed to updates!");
      setEmail("");
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="p-3 rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle>Stay Informed</CardTitle>
        <CardDescription>
          Subscribe to receive updates about polls, announcements, and democratic initiatives
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubscribe} className="flex gap-2">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading} className="gradient-hero">
            Subscribe
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
