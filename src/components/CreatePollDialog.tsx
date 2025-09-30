import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const CreatePollDialog = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [options, setOptions] = useState(["", ""]);

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error(t('poll.enterTitle'));
      return;
    }

    const validOptions = options.filter(opt => opt.trim() !== "");
    if (validOptions.length < 2) {
      toast.error(t('poll.min2Options'));
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error(t('auth.loginToCreate'));
      return;
    }

    // Create poll
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        user_id: session.user.id,
        title: title,
        description: description || null,
        category: category as any
      })
      .select()
      .single();

    if (pollError || !poll) {
      toast.error(t('poll.createdFailed'));
      return;
    }

    // Create options
    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(
        validOptions.map(opt => ({
          poll_id: poll.id,
          option_text: opt
        }))
      );

    if (optionsError) {
      toast.error(t('poll.optionsFailed'));
      return;
    }

    toast.success(t('poll.created'));
    setOpen(false);
    setTitle("");
    setDescription("");
    setCategory("other");
    setOptions(["", ""]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-hero">
          <Plus className="h-4 w-4 mr-2" />
          {t('poll.createNew')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('poll.createTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('poll.title')} *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('poll.question')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('poll.description')}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('poll.descriptionPlaceholder')}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">{t('poll.category')}</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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

          <div className="space-y-2">
            <Label>{t('poll.options')} *</Label>
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`${t('poll.option')} ${index + 1}`}
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addOption} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              {t('poll.addOption')}
            </Button>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('poll.cancel')}
            </Button>
            <Button type="submit" className="gradient-hero">
              {t('poll.createNew')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
