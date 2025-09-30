import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StatsCounter } from "@/components/StatsCounter";
import { PollCard } from "@/components/PollCard";
import { CreatePollDialog } from "@/components/CreatePollDialog";
import { GoFundMeCard } from "@/components/GoFundMeCard";
import { EmailSubscribe } from "@/components/EmailSubscribe";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-parliament.jpg";

const Index = () => {
  const { t } = useTranslation();
  const [polls, setPolls] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchPolls();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const fetchPolls = async () => {
    const { data } = await supabase
      .from('polls')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(3);

    if (data) {
      setPolls(data);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <img 
          src={heroImage} 
          alt="Sudan Voice Nexus Parliament" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        <div className="container relative py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center text-white space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold text-balance animate-fade-in">
              {t('hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 text-balance">
              {t('hero.subtitle')}
            </p>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              {t('hero.description')}
            </p>
            <div className="flex gap-4 justify-center pt-4">
              {!user && (
                <Button asChild size="lg" variant="secondary">
                  <Link to="/auth">
                    {t('hero.joinNow')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              )}
              <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Link to="/polls">{t('hero.viewPolls')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container">
        <StatsCounter />
      </section>

      {/* GoFundMe Section */}
      <section className="container mb-12">
        <GoFundMeCard />
      </section>

      {/* Recent Polls Section */}
      <section className="container mb-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold">{t('polls.recent')}</h2>
            <p className="text-muted-foreground">{t('polls.recentDescription')}</p>
          </div>
          <div className="flex gap-2">
            {user && <CreatePollDialog />}
            <Button asChild variant="outline">
              <Link to="/polls">{t('polls.viewAll')}</Link>
            </Button>
          </div>
        </div>

        {polls.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>{t('polls.noPollsYet')}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        )}
      </section>

      {/* Email Subscribe Section */}
      <section className="container mb-12">
        <EmailSubscribe />
      </section>

      <Footer />
    </div>
  );
};

export default Index;
