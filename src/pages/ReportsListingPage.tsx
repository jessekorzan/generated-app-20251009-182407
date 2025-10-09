import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import { Interview, AggregateReport, ReportType } from '@shared/types';
import { formatDate } from '@/lib/utils';
import { FileText, Files, PlusCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { useGlobalFiltersStore } from '@/stores/useGlobalFiltersStore';
import { QuickAction } from "../components/QuickActionsDropdown";
import { useSort } from "../hooks/useSort";
import { InterviewsTable } from "../components/InterviewsTable";
import { OutletContextType } from '@/types/header';
import { Badge } from '@/components/ui/badge';
const getReportTypeBadgeVariant = (reportType?: ReportType) => {
  switch (reportType) {
    case 'Human':
      return 'secondary';
    case 'AI':
      return 'default';
    case 'Blind Spot':
      return 'outline';
    case 'Survey':
      return 'secondary';
    default:
      return 'outline';
  }
};
function AggregateReportsTable({ reports, loading }: { reports: AggregateReport[]; loading: boolean; }) {
  const { items: sortedReports, requestSort, sortConfig } = useSort(reports, { key: 'dateGenerated', direction: 'desc' });
  const SortableHeader = ({ sortKey, children }: { sortKey: keyof AggregateReport; children: React.ReactNode; }) => {
    const isSorted = sortConfig?.key === sortKey;
    return (
      <Button variant="ghost" onClick={() => requestSort(sortKey)} className="px-2 py-1 h-auto -ml-2">
        {children}
        {isSorted && (
          sortConfig?.direction === 'asc' ?
            <ArrowUp className="ml-2 h-4 w-4" /> :
            <ArrowDown className="ml-2 h-4 w-4" />)
        }
      </Button>
    );
  };
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead><SortableHeader sortKey="title">Report Title</SortableHeader></TableHead>
          <TableHead className="hidden sm:table-cell">Source Interviews</TableHead>
          <TableHead className="hidden md:table-cell"><SortableHeader sortKey="reportType">Type</SortableHeader></TableHead>
          <TableHead className="hidden md:table-cell"><SortableHeader sortKey="dateGenerated">Date Generated</SortableHeader></TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) =>
            <TableRow key={i}>
              <TableCell><Skeleton className="h-5 w-2/3" /></TableCell>
              <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
              <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-16" /></TableCell>
              <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
            </TableRow>
          )) :
          sortedReports.length > 0 ? (
            sortedReports.map((report) =>
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.title}</TableCell>
                <TableCell className="hidden sm:table-cell">{report.sourceInterviewIds.length}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge className="text-xs" variant={getReportTypeBadgeVariant(report.reportType)}>
                    {report.reportType}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{formatDate(report.dateGenerated)}</TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/reports/aggregate/${report.id}`}>View Report</Link>
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">No aggregate reports found for the selected filters.</TableCell>
            </TableRow>
          )}
      </TableBody>
    </Table>
  );
}
export function ReportsListingPage() {
  const { setHeaderConfig } = useOutletContext<OutletContextType>();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [aggregateReports, setAggregateReports] = useState<AggregateReport[]>([]);
  const [interviewsLoading, setInterviewsLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);
  const { dateRange, selectedCompetitors, selectedOutcomes, selectedProgramIds, openReportModal } = useGlobalFiltersStore();
  const handleQuickAction = useCallback((action: QuickAction) => {
    openReportModal({
      initialPromptId: action.promptId,
      initialOutcomeFilter: action.outcomeFilter
    });
  }, [openReportModal]);
  const headerConfig = useMemo(() => ({
    title: "Reports",
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Reports' }],
    primaryAction: { label: 'Generate Report', icon: PlusCircle, onClick: () => openReportModal() },
    onQuickActionSelect: handleQuickAction,
    showFilters: true,
  }), [openReportModal, handleQuickAction]);
  useEffect(() => {
    setHeaderConfig(headerConfig);
  }, [setHeaderConfig, headerConfig]);
  useEffect(() => {
    const interviewParams = {
      from: dateRange?.from?.toISOString(),
      to: dateRange?.to?.toISOString(),
      competitors: selectedCompetitors,
      outcomes: selectedOutcomes,
      programIds: selectedProgramIds
    };
    const aggregateReportParams = {
      from: dateRange?.from?.toISOString(),
      to: dateRange?.to?.toISOString()
    };
    const fetchInterviews = async () => {
      try {
        setInterviewsLoading(true);
        const data = await api<Interview[]>('/api/interviews', undefined, interviewParams);
        setInterviews(data);
      } catch (error) {
        console.error("Failed to fetch interviews:", error);
      } finally {
        setInterviewsLoading(false);
      }
    };
    const fetchAggregateReports = async () => {
      try {
        setReportsLoading(true);
        const data = await api<AggregateReport[]>('/api/reports/aggregate', undefined, aggregateReportParams);
        setAggregateReports(data);
      } catch (error) {
        console.error("Failed to fetch aggregate reports:", error);
      } finally {
        setReportsLoading(false);
      }
    };
    fetchInterviews();
    fetchAggregateReports();
  }, [dateRange, selectedCompetitors, selectedOutcomes, selectedProgramIds]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Reports</CardTitle>
        <CardDescription>
          Browse individual interview summaries and generated aggregate reports.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="interviews">
          <TabsList>
            <TabsTrigger value="interviews"><FileText className="w-4 h-4 mr-2" />Individual Interviews</TabsTrigger>
            <TabsTrigger value="aggregate"><Files className="w-4 h-4 mr-2" />Aggregate Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="interviews" className="mt-4">
            <InterviewsTable interviews={interviews} loading={interviewsLoading} />
          </TabsContent>
          <TabsContent value="aggregate" className="mt-4">
            <AggregateReportsTable reports={aggregateReports} loading={reportsLoading} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}