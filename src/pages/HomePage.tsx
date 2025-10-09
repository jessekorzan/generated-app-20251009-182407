import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  CircleDashed,
  Users,
  MessageSquareQuote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import { Interview, DashboardStats, DashboardQuote } from '@shared/types';
import { InterviewsTable } from "../components/InterviewsTable";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PromptBuilder } from '@/components/PromptBuilder';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { OutletContextType } from '@/types/header';
export function HomePage() {
  const navigate = useNavigate();
  const { setHeaderConfig } = useOutletContext<OutletContextType>();
  const [pipelineInterviews, setPipelineInterviews] = useState<Interview[]>([]);
  const [dashboardQuotes, setDashboardQuotes] = useState<DashboardQuote[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pipelineLoading, setPipelineLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [quotesLoading, setQuotesLoading] = useState(true);
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(false);
  const [chartView, setChartView] = useState<'winLoss' | 'drivers'>('winLoss');
  useEffect(() => {
    setHeaderConfig({
      title: "Dashboard",
      breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Dashboard' }],
      showFilters: false,
    });
  }, [setHeaderConfig]);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const statsData = await api<DashboardStats>('/api/dashboard/stats');
        setStats(statsData);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);
  useEffect(() => {
    const fetchInterviewsAndQuotes = async () => {
      setPipelineLoading(true);
      setQuotesLoading(true);
      try {
        const pipelineParams = {
          source: 'dashboard_pipeline',
          upcomingOnly: showUpcomingOnly ? 'true' : undefined
        };
        const pipelineData = await api<Interview[]>('/api/interviews', undefined, pipelineParams);
        setPipelineInterviews(pipelineData);
        const quotesData = await api<DashboardQuote[]>('/api/dashboard/quotes');
        setDashboardQuotes(quotesData);
      } catch (error) {
        console.error("Failed to fetch interviews or quotes:", error);
      } finally {
        setPipelineLoading(false);
        setQuotesLoading(false);
      }
    };
    fetchInterviewsAndQuotes();
  }, [showUpcomingOnly]);
  return (
    <div className="space-y-4 md:space-y-8">
      <Card className="bg-gradient-to-br from-primary/5 via-card to-card border-2 border-primary/20 shadow-lg shadow-primary/10">
        <CardContent className="p-6 md:p-8">
          <PromptBuilder />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {statsLoading || !stats ?
          Array.from({ length: 4 }).map((_, i) =>
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-1/3 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ) :
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalInterviews}</div>
                <p className="text-xs text-muted-foreground">In the last 6 months</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedInterviews}</div>
                <p className="text-xs text-muted-foreground">{stats.totalInterviews > 0 ? `${Math.round(stats.completedInterviews / stats.totalInterviews * 100)}% of total` : 'N/A'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                <CircleDashed className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.winRate}%</div>
                <p className="text-xs text-muted-foreground">Based on last 6 months</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Key Competitor</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.keyCompetitor.name}</div>
                <p className="text-xs text-muted-foreground">Mentioned in {stats.keyCompetitor.mentionCount} interviews</p>
              </CardContent>
            </Card>
          </>
        }
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Data from the last 6 months.</CardDescription>
              </div>
              <ToggleGroup type="single" value={chartView} onValueChange={(value) => value && setChartView(value as 'winLoss' | 'drivers')} size="sm">
                <ToggleGroupItem value="winLoss">Win/Loss</ToggleGroupItem>
                <ToggleGroupItem value="drivers">Drivers</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            {statsLoading ? <Skeleton className="w-full h-[350px]" /> :
              chartView === 'winLoss' ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={stats?.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                    <Legend />
                    <Bar dataKey="wins" fill="hsl(var(--primary))" name="Wins" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="losses" fill="hsl(var(--muted-foreground))" name="Losses" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={stats?.buyerDecisionDrivers} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="driver" type="category" width={120} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                    <Bar dataKey="impact" name="Impact Score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )
            }
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Key Soundbites</CardTitle>
            <CardDescription>Impactful quotes from recent interviews.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {quotesLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-1/2 mt-1" />
                </div>
              ))
            ) : dashboardQuotes.length > 0 ? (
              dashboardQuotes.map((quote) => (
                <div key={quote.id}>
                  <blockquote className="border-l-4 border-primary pl-4 italic text-lg font-medium leading-relaxed">
                    "{quote.text}"
                  </blockquote>
                  <footer className="mt-2">
                    <p className="text-sm font-semibold not-italic">{quote.participantInfo}</p>
                    <Button asChild variant="link" size="sm" className="p-0 h-auto text-xs">
                      <Link to={`/interview/${quote.interviewId}`}>From: {quote.interviewTitle}</Link>
                    </Button>
                  </footer>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquareQuote className="mx-auto h-8 w-8 mb-2" />
                <p>No quotes available from recent interviews.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Interview Pipeline</CardTitle>
            <CardDescription>Upcoming interviews & interviews from the last 6 months.</CardDescription>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="upcoming-only"
                checked={showUpcomingOnly}
                onCheckedChange={setShowUpcomingOnly} />
              <Label htmlFor="upcoming-only">Upcoming only</Label>
            </div>
            <Button onClick={() => navigate('/reports')} size="sm" variant="outline">
              View All
              <ArrowUpRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <InterviewsTable interviews={pipelineInterviews} loading={pipelineLoading} />
        </CardContent>
      </Card>
    </div>
  );
}