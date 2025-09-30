import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Vote } from "lucide-react";

export const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="border-t bg-muted/50 mt-20">
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="gradient-hero p-2 rounded-lg">
                <Vote className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold">Sudan Voice Nexus</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('footer.description')}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">{t('footer.navigation')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">{t('nav.home')}</Link></li>
              <li><Link to="/polls" className="hover:text-foreground transition-colors">{t('nav.polls')}</Link></li>
              <li><Link to="/profile" className="hover:text-foreground transition-colors">{t('nav.profile')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">{t('footer.resources')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">{t('footer.aboutUs')}</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">{t('footer.howItWorks')}</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">{t('footer.contact')}</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">{t('footer.legal')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">{t('footer.privacy')}</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">{t('footer.terms')}</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Sudan Voice Nexus. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
};
