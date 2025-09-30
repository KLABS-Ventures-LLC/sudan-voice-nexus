import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

interface PollOption {
  id: string;
  option_text: string;
  votes_count: number;
}

interface Poll {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
}

interface PollCardProps {
  poll: Poll;
}

export const PollCard = ({ poll }: PollCardProps) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState<PollOption[]>([]);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchOptions();
    checkUserAuth();
  }, [poll.id]);

  const checkUserAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUserId(session?.user?.id || null);
    if (session?.user?.id) {
      checkUserVote(session.user.id);
    }
  };

  const checkUserVote = async (uid: string) => {
    const { data } = await supabase
      .from('votes')
      .select('option_id')
      .eq('poll_id', poll.id)
      .eq('user_id', uid)
      .maybeSingle();

    if (data) {
      setUserVote(data.option_id);
    }
  };

  const fetchOptions = async () => {
    const { data } = await supabase
      .from('poll_options')
      .select('*')
      .eq('poll_id', poll.id)
      .order('option_text');

    if (data) {
      setOptions(data);
    }
  };

  const handleVote = async (optionId: string) => {
    if (!userId) {
      toast.error(t('auth.loginToVote'));
      return;
    }

    if (userVote) {
      // Update existing vote
      const { error } = await supabase
        .from('votes')
        .update({ option_id: optionId })
        .eq('poll_id', poll.id)
        .eq('user_id', userId);

      if (!error) {
        setUserVote(optionId);
        toast.success(t('auth.voteUpdated'));
        fetchOptions();
      }
    } else {
      // Create new vote
      const { error } = await supabase
        .from('votes')
        .insert({
          poll_id: poll.id,
          option_id: optionId,
          user_id: userId
        });

      if (!error) {
        setUserVote(optionId);
        toast.success(t('auth.voteRecorded'));
        fetchOptions();
      } else {
        toast.error(t('auth.voteFailed'));
      }
    }
  };

  const totalVotes = options.reduce((sum, opt) => sum + opt.votes_count, 0);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-xl">{poll.title}</CardTitle>
            {poll.description && (
              <CardDescription>{poll.description}</CardDescription>
            )}
          </div>
          <Badge variant="secondary" className="capitalize">
            {t(`poll.categories.${poll.category}`)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {options.map((option) => {
          const percentage = totalVotes > 0 ? (option.votes_count / totalVotes) * 100 : 0;
          const isSelected = userVote === option.id;

          return (
            <div key={option.id} className="space-y-2">
              <Button
                variant={isSelected ? "default" : "outline"}
                className="w-full justify-between h-auto py-3"
                onClick={() => handleVote(option.id)}
              >
                <span className="flex items-center gap-2">
                  {isSelected && <CheckCircle2 className="h-4 w-4" />}
                  {option.option_text}
                </span>
                <span className="font-bold">{option.votes_count}</span>
              </Button>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
        <p className="text-sm text-muted-foreground text-center pt-2">
          {t('polls.totalVotes')}: {totalVotes}
        </p>
      </CardContent>
    </Card>
  );
};
