import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import { AnalyticsData } from '@shared/types';
import { useGlobalFiltersStore } from '@/stores/useGlobalFiltersStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { QuickAction } from "../components/QuickActionsDropdown";
import { PlusCircle } from 'lucide-react';
import { ThemesPromptWidget } from '@/components/ThemesPromptWidget';
import { OutletContextType } from '@/types/header';
import { ThemeCategoryCard } from '@/components/ThemeCategoryCard';
export function ThemesPage() {
  const { setHeaderConfig } = useOutletContext<OutletContextType>();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { dateRange, selectedCompetitors, selectedOutcomes, selectedProgramIds, openReportModal, showChatUI } = useGlobalFiltersStore();
  const handleQuickAction = useCallback((action: QuickAction) => {
    openReportModal({
      initialPromptId: action.promptId,
      initialOutcomeFilter: action.outcomeFilter
    });
  }, [openReportModal]);
  const headerConfig = useMemo(() => ({
    title: "Themes",
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Themes' }],
    primaryAction: { label: 'Generate Report', icon: PlusCircle, onClick: () => openReportModal() },
    onQuickActionSelect: handleQuickAction,
    showFilters: true
  }), [openReportModal, handleQuickAction]);
  useEffect(() => {
    setHeaderConfig(headerConfig);
  }, [setHeaderConfig, headerConfig]);
  useEffect(() => {
    const fetchAnalytics = async () => {
      const params = {
        from: dateRange?.from?.toISOString(),
        to: dateRange?.to?.toISOString(),
        competitors: selectedCompetitors,
        outcomes: selectedOutcomes,
        programIds: selectedProgramIds
      };
      try {
        setLoading(true);
        const data = await api<AnalyticsData>('/api/analytics', undefined, params);
        setAnalyticsData(data);
      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [dateRange, selectedCompetitors, selectedOutcomes, selectedProgramIds]);
  return (
    <div className="space-y-8">
      {showChatUI && <ThemesPromptWidget />}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-4">
                  <Skeleton className="h-5 w-24" />
                  <Separator />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-5 w-24" />
                  <Separator />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          analyticsData?.themes.map((theme) => (
            <ThemeCategoryCard key={theme.categoryName} theme={theme} />
          ))
        )}
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Competitor Mentions</CardTitle>
            <CardDescription>Frequency of competitor mentions in interviews.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="w-full h-[350px]" /> :
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={analyticsData?.competitorMentions} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="count" name="Mentions" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            }
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Product Feedback Sentiment</CardTitle>
            <CardDescription>Sentiment analysis of feedback on key product features.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="w-full h-[350px]" /> :
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={analyticsData?.productFeedbackSentiment}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="feature" />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="positive" stackId="a" fill="hsl(var(--primary))" name="Positive" />
                  <Bar dataKey="neutral" stackId="a" fill="hsl(var(--muted-foreground))" name="Neutral" />
                  <Bar dataKey="negative" stackId="a" fill="hsl(var(--destructive))" name="Negative" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            }
          </CardContent>
        </Card>
      </div>
    </div>
  );
}