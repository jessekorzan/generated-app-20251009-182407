import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, getTagColors } from '@/lib/utils';
import {
  BarChart,
  FileText,
  Lightbulb,
  MessageSquareQuote,
  Users,
  FlaskConical,
} from 'lucide-react';
import { KeyTakeaway, Interview } from '@shared/types';
import { api } from '@/lib/api-client';
import { Skeleton } from '@/components/ui/skeleton';
const categoryIcons: { [key in KeyTakeaway['category']]: React.ElementType } = {
  Strength: () => <span className="text-green-500">▲</span>,
  Weakness: () => <span className="text-red-500">▼</span>,
  Opportunity: () => <span className="text-blue-500">💡</span>,
  Threat: () => <span className="text-yellow-500">⚠️</span>,
};
function ReportSkeleton() {
  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 animate-pulse">
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
      <Card>
        <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
export function SharedReportPage() {
  const { id } = useParams<{ id: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!id) {
      setError("No report ID provided.");
      setLoading(false);
      return;
    }
    const fetchInterview = async () => {
      try {
        setLoading(true);
        const data = await api<Interview>(`/api/share/${id}`);
        setInterview(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch shared report:", err);
        setError("Failed to load the report. The link may be invalid or expired.");
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [id]);
  const report = interview?.report;
  return (
    <div className="min-h-screen bg-muted/40 p-4 sm:p-6 lg:p-8">
      <header className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
        <div className="flex items-center gap-2 font-display font-semibold text-lg">
          <BarChart className="h-6 w-6 text-primary" />
          <span>BuyersLens</span>
        </div>
      </header>
      <main>
        {loading ? <ReportSkeleton /> : error || !interview || !report ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-semibold">Error Loading Report</h2>
            <p className="text-muted-foreground mt-2">{error || "This report could not be found."}</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-display">{interview.title}</CardTitle>
                <CardDescription className="text-base">
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
            <div className="grid md:grid-cols-2 gap-8">
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
        )}
      </main>
      <footer className="text-center mt-12 text-sm text-muted-foreground">
        Built with ❤️ at Cloudflare
      </footer>
    </div>
  );
}