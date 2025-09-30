import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Heart } from "lucide-react";

export const GoFundMeCard = () => {
  const { t } = useTranslation();
  // Replace this URL with actual GoFundMe link
  const gofundmeUrl = "https://gofundme.com/your-campaign";

  return (
    <Card className="border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-5 w-5 text-secondary" />
          <CardTitle>{t('gofundme.title')}</CardTitle>
        </div>
        <CardDescription>
          {t('gofundme.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('gofundme.goal')}</span>
            <span className="font-semibold">$100,000</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-accent w-2/3" />
          </div>
          <p className="text-sm text-muted-foreground">
            67% {t('gofundme.funded')} • 1,234 {t('gofundme.supporters')}
          </p>
        </div>
        
        <Button asChild className="w-full gradient-accent">
          <a href={gofundmeUrl} target="_blank" rel="noopener noreferrer">
            <Heart className="h-4 w-4 mr-2" />
            {t('gofundme.contribute')}
            <ExternalLink className="h-4 w-4 ml-2" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};
