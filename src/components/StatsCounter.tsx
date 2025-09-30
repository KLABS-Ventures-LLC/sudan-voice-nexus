import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ShieldCheck } from "lucide-react";

export const StatsCounter = () => {
  const [totalSupporters, setTotalSupporters] = useState(0);
  const [verifiedSupporters, setVerifiedSupporters] = useState(0);

  useEffect(() => {
    fetchStats();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStats = async () => {
    const { count: total } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: verified } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('verification_status', 'verified');

    setTotalSupporters(total || 0);
    setVerifiedSupporters(verified || 0);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 my-12">
      <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Supporters</p>
              <p className="text-4xl font-bold text-primary animate-fade-in">
                {totalSupporters.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-success/20 hover:border-success/40 transition-all">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-full bg-success/10">
              <ShieldCheck className="h-8 w-8 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verified Supporters</p>
              <p className="text-4xl font-bold text-success animate-fade-in">
                {verifiedSupporters.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
