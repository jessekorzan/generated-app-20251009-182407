import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, FileText, List } from 'lucide-react';
import { AggregateReport, Interview } from '@shared/types';
import { api } from '@/lib/api-client';
import { Skeleton } from '@/components/ui/skeleton';
import { OutletContextType } from '@/types/header';
function ReportSkeleton() {
  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 animate-pulse">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    </div>
  );
}
export function AggregateReportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setHeaderConfig } = useOutletContext<OutletContextType>();
  const [report, setReport] = useState<AggregateReport | null>(null);
  const [sourceInterviews, setSourceInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const headerConfig = useMemo(() => ({
    title: loading ? 'Loading Report...' : report?.title || 'Aggregate Report',
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Reports', href: '/reports' },
      { label: 'Aggregate Report' },
    ],
    secondaryAction: { label: 'Back', icon: ArrowLeft, onClick: () => navigate(-1) },
    showFilters: false,
  }), [loading, report, navigate]);
  useEffect(() => {
    setHeaderConfig(headerConfig);
  }, [setHeaderConfig, headerConfig]);
  useEffect(() => {
    if (!id) {
      setError("No report ID provided.");
      setLoading(false);
      return;
    }
    const fetchReport = async () => {
      try {
        setLoading(true);
        const reportData = await api<AggregateReport>(`/api/reports/aggregate/${id}`);
        setReport(reportData);
        const interviewPromises = reportData.sourceInterviewIds.map(interviewId =>
          api<Interview>(`/api/interviews/${interviewId}`)
        );
        const interviewsData = await Promise.all(interviewPromises);
        setSourceInterviews(interviewsData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch aggregate report:", err);
        setError("Failed to load the report. It may not exist.");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <FileText className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold">Error Loading Report</h2>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={() => navigate('/reports')} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Reports
        </Button>
      </div>
    );
  }
  return (
    <>
      {loading ? <ReportSkeleton /> : !report ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <FileText className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold">Report Not Found</h2>
          <p className="text-muted-foreground mt-2">This aggregate report could not be found.</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto w-full space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{report.title}</CardTitle>
              <CardDescription>
                Generated on {formatDate(report.dateGenerated)} from {report.sourceInterviewIds.length} interviews.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground prose dark:prose-invert max-w-none">
              <p>{report.generatedSummary}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><List className="w-5 h-5" /> Source Interviews</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {sourceInterviews.map(interview => (
                  <li key={interview.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{interview.title}</p>
                      <p className="text-sm text-muted-foreground">{interview.participantName} @ {interview.company}</p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/interview/${interview.id}`}>View Original</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}