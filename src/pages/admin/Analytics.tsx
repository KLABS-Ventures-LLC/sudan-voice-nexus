import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const Analytics = () => {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState({
    byLocation: [] as any[],
    byOccupation: [] as any[]
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('location, occupation');

    if (profiles) {
      // Group by location
      const locationMap = new Map();
      profiles.forEach(p => {
        if (p.location) {
          locationMap.set(p.location, (locationMap.get(p.location) || 0) + 1);
        }
      });

      // Group by occupation
      const occupationMap = new Map();
      profiles.forEach(p => {
        if (p.occupation) {
          occupationMap.set(p.occupation, (occupationMap.get(p.occupation) || 0) + 1);
        }
      });

      setAnalytics({
        byLocation: Array.from(locationMap.entries()).map(([name, count]) => ({ name, count })),
        byOccupation: Array.from(occupationMap.entries()).map(([name, count]) => ({ name, count }))
      });
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-5xl font-extrabold mb-8">{t('admin.analytics')}</h1>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t('admin.locationAnalytics')}</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.byLocation.length === 0 ? (
                <p className="text-muted-foreground">{t('admin.noLocationData')}</p>
              ) : (
                <div className="space-y-4">
                  {analytics.byLocation
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10)
                    .map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="font-medium">{item.name}</span>
                        <div className="flex items-center gap-4">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${(item.count / analytics.byLocation[0].count) * 100}%` }}
                            />
                          </div>
                          <span className="text-muted-foreground w-12 text-right">{item.count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t('admin.occupationAnalytics')}</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.byOccupation.length === 0 ? (
                <p className="text-muted-foreground">{t('admin.noOccupationData')}</p>
              ) : (
                <div className="space-y-4">
                  {analytics.byOccupation
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10)
                    .map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="font-medium">{item.name}</span>
                        <div className="flex items-center gap-4">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-secondary" 
                              style={{ width: `${(item.count / analytics.byOccupation[0].count) * 100}%` }}
                            />
                          </div>
                          <span className="text-muted-foreground w-12 text-right">{item.count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-2xl">{t('admin.analytics')}</CardTitle>
          </CardHeader>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {t('admin.globePlaceholder')}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {t('admin.globeNote')}
            </p>
          </CardContent>
        </Card>
    </AdminLayout>
  );
};

export default Analytics;
