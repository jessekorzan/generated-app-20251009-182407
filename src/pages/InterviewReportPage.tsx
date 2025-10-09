import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, getTagColors } from '@/lib/utils';
import {
  ArrowLeft,
  Share2,
  FileText,
  Lightbulb,
  MessageSquareQuote,
  Users,
  FlaskConical,
} from 'lucide-react';
import { KeyTakeaway, Interview } from '@shared/types';
import { api } from '@/lib/api-client';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { OutletContextType } from '@/types/header';
const categoryIcons: { [key in KeyTakeaway['category']]: React.ElementType } = {
  Strength: () => <span className="text-blue-500">🚀</span>,
  Weakness: () => <span className="text-red-500">▼</span>,
  Opportunity: () => <span className="text-blue-500">💡</span>,
  Threat: () => <span className="text-yellow-500">���️</span>,
};
function ReportSkeleton() {
  return (
    <div className="max-w-7xl mx-auto w-full space-y-8 animate-pulse">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </CardContent>
      </Card>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
export function InterviewReportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setHeaderConfig } = useOutletContext<OutletContextType>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const handleShare = useCallback(() => {
    if (!id) return;
    const shareUrl = `${window.location.origin}/share/${id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success('Share link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy link.');
    });
  }, [id]);
  const headerConfig = useMemo(() => ({
    title: loading ? 'Loading Report...' : interview?.title || 'Interview Report',
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Reports', href: '/reports' },
      { label: 'Report' },
    ],
    primaryAction: { label: 'Share', icon: Share2, onClick: handleShare },
    secondaryAction: { label: 'Back', icon: ArrowLeft, onClick: () => navigate(-1) },
    showFilters: false,
  }), [loading, interview, navigate, handleShare]);
  useEffect(() => {
    setHeaderConfig(headerConfig);
  }, [setHeaderConfig, headerConfig]);
  useEffect(() => {
    if (!id) {
      setError("No interview ID provided.");
      setLoading(false);
      return;
    }
    const fetchInterview = async () => {
      try {
        setLoading(true);
        const data = await api<Interview>(`/api/interviews/${id}`);
        setInterview(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch interview report:", err);
        setError("Failed to load the interview report. It may not exist.");
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [id]);
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <FileText className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold">Error Loading Report</h2>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={() => navigate('/')} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }
  const report = interview?.report;
  return (
    <>
      {loading ? <ReportSkeleton /> : !interview || !report ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <FileText className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold">Report Not Available</h2>
          <p className="text-muted-foreground mt-2">
            A detailed report has not been generated for this interview yet.
          </p>
          <Button onClick={() => navigate('/')} className="mt-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto w-full space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{interview.title}</CardTitle>
              <CardDescription>
                Interview with {interview.participantName} ({interview.participantRole}) from {interview.company} on {formatDate(interview.date)}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {report.tags.map(tag => (
                  <Badge key={tag.id} className={getTagColors(tag.color)} variant="secondary">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Executive Summary</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground prose dark:prose-invert max-w-none">
                  <p>{report.summary}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Lightbulb className="w-5 h-5" /> Key Takeaways</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {report.keyTakeaways.map(takeaway => {
                      const Icon = categoryIcons[takeaway.category];
                      return (
                        <li key={takeaway.id} className="flex items-start gap-3">
                          <span className="mt-1"><Icon /></span>
                          <div>
                            <span className="font-semibold">{takeaway.category}:</span>
                            <span className="text-muted-foreground ml-2">{takeaway.text}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><MessageSquareQuote className="w-5 h-5" /> Notable Quotes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {report.quotes.map(quote => (
                    <blockquote key={quote.id} className="border-l-4 pl-4 italic">
                      <p className="text-muted-foreground">"{quote.text}"</p>
                      <footer className="mt-2 text-sm font-semibold not-italic">— {quote.attribution}</footer>
                    </blockquote>
                  ))}
                </CardContent>
              </Card>
            </div>
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Competitors</CardTitle>
                </CardHeader>
                <CardContent>
                  {report.competitorsMentioned.length > 0 ? (
                    <ul className="space-y-2">
                      {report.competitorsMentioned.map(c => <li key={c.id} className="text-muted-foreground">{c.name}</li>)}
                    </ul>
                  ) : <p className="text-sm text-muted-foreground">No competitors mentioned.</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><FlaskConical className="w-5 h-5" /> Product Feedback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {report.productFeedback.length > 0 ? report.productFeedback.map(fb => (
                    <div key={fb.id}>
                      <div className="font-semibold flex items-center justify-between">
                        <span>{fb.feature}</span>
                        <Badge variant={fb.sentiment === 'Positive' ? 'default' : fb.sentiment === 'Negative' ? 'destructive' : 'outline'}>
                          {fb.sentiment}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{fb.comment}</p>
                    </div>
                  )) : <p className="text-sm text-muted-foreground">No specific product feedback.</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </>
  );
}