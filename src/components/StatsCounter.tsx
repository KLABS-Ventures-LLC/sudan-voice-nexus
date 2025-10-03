import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ShieldCheck } from "lucide-react";

export const StatsCounter = () => {
  const { t } = useTranslation();
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 my-8 sm:my-12 px-4">
      <Card className="border-2 border-primary/30 hover:border-primary/60 transition-all shadow-golden hover:shadow-golden bg-gradient-to-br from-primary/5 to-primary/10 min-h-[220px] sm:min-h-[280px]">
        <CardContent className="pt-6 sm:pt-10 pb-6 sm:pb-10">
          <div className="flex flex-col items-center text-center gap-4 sm:gap-6">
            <div className="p-4 sm:p-6 rounded-full gradient-golden shadow-golden">
              <Users className="h-8 w-8 sm:h-12 sm:w-12 text-background" />
            </div>
            <div>
              <p className="text-sm sm:text-lg font-medium text-muted-foreground mb-2">{t('stats.supporters')}</p>
              <p className="text-4xl sm:text-6xl font-bold text-primary animate-fade-in">
                {totalSupporters.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-success/30 hover:border-success/60 transition-all shadow-golden hover:shadow-golden bg-gradient-to-br from-success/5 to-success/10 min-h-[220px] sm:min-h-[280px]">
        <CardContent className="pt-6 sm:pt-10 pb-6 sm:pb-10">
          <div className="flex flex-col items-center text-center gap-4 sm:gap-6">
            <div className="p-4 sm:p-6 rounded-full gradient-golden shadow-golden">
              <ShieldCheck className="h-8 w-8 sm:h-12 sm:w-12 text-background" />
            </div>
            <div>
              <p className="text-sm sm:text-lg font-medium text-muted-foreground mb-2">{t('stats.verifiedSupporters')}</p>
              <p className="text-4xl sm:text-6xl font-bold text-success animate-fade-in">
                {verifiedSupporters.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
