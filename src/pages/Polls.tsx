import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PollCard } from "@/components/PollCard";
import { CreatePollDialog } from "@/components/CreatePollDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

const Polls = () => {
  const { t } = useTranslation();
  const [polls, setPolls] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [category, setCategory] = useState<string>("all");

  useEffect(() => {
    fetchPolls();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const channel = supabase
      .channel('polls-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'polls'
        },
        () => fetchPolls()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [category]);

  const fetchPolls = async () => {
    let query = supabase
      .from('polls')
      .select('*')
      .eq('is_active', true)
      .eq('approved', true)
      .order('created_at', { ascending: false });

    if (category !== "all") {
      query = query.eq('category', category as any);
    }

    const { data } = await query;

    if (data) {
      setPolls(data);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="container py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-5xl font-extrabold mb-2">{t('nav.polls')}</h1>
            <p className="text-muted-foreground text-lg">
              Participate in ongoing discussions and make your voice heard
            </p>
          </div>
          <div className="flex gap-2">
            {user && <CreatePollDialog />}
          </div>
        </div>

        <div className="mb-6">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue />
            </SelectTrigger>
              <SelectContent>
              <SelectItem value="all">{t('poll.categories.all')}</SelectItem>
              <SelectItem value="governance">{t('poll.categories.governance')}</SelectItem>
              <SelectItem value="economy">{t('poll.categories.economy')}</SelectItem>
              <SelectItem value="education">{t('poll.categories.education')}</SelectItem>
              <SelectItem value="health">{t('poll.categories.health')}</SelectItem>
              <SelectItem value="infrastructure">{t('poll.categories.infrastructure')}</SelectItem>
              <SelectItem value="security">{t('poll.categories.security')}</SelectItem>
              <SelectItem value="other">{t('poll.categories.other')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {polls.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {t('polls.noPollsYet')}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Polls;
