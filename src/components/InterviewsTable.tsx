import React from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Interview, InterviewOutcome, ReportType } from '@shared/types';
import { formatDate, cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Lock } from 'lucide-react';
import { useSort } from '@/hooks/useSort';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from 'sonner';
interface InterviewsTableProps {
  interviews: Interview[];
  loading: boolean;
}
const getOutcomeBadgeVariant = (outcome?: InterviewOutcome) => {
  switch (outcome) {
    case 'Won':
    case 'Renew':
      return 'default';
    case 'Lost':
    case 'Churn':
      return 'destructive';
    default:
      return 'outline';
  }
};
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
export function InterviewsTable({ interviews, loading }: InterviewsTableProps) {
  const { items: sortedInterviews, requestSort, sortConfig } = useSort(interviews, { key: 'date', direction: 'desc' });
  const SortableHeader = ({ sortKey, children, className }: { sortKey: keyof Interview, children: React.ReactNode, className?: string }) => {
    const isSorted = sortConfig?.key === sortKey;
    return (
      <TableHead className={className}>
        <Button variant="ghost" onClick={() => requestSort(sortKey)} className="px-2 py-1 h-auto -ml-2">
          {children}
          {isSorted && (
            sortConfig?.direction === 'asc'
              ? <ArrowUp className="ml-2 h-4 w-4" />
              : <ArrowDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      </TableHead>
    );
  };
  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader sortKey="title">Interview</SortableHeader>
            <SortableHeader sortKey="status" className="hidden sm:table-cell">Status</SortableHeader>
            <SortableHeader sortKey="reportType" className="hidden lg:table-cell">Type</SortableHeader>
            <SortableHeader sortKey="outcome" className="hidden lg:table-cell">Outcome</SortableHeader>
            <TableHead className="hidden xl:table-cell">Competitors</TableHead>
            <SortableHeader sortKey="date" className="hidden md:table-cell">Interview Date</SortableHeader>
            <TableHead className="hidden lg:table-cell">Deal Closed</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-1/2 mb-1" />
                  <Skeleton className="h-4 w-1/3" />
                </TableCell>
                <TableCell className="hidden sm:table-cell"><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell className="hidden lg:table-cell"><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell className="hidden lg:table-cell"><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell className="hidden xl:table-cell"><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : sortedInterviews.length > 0 ? (
            sortedInterviews.map(interview => (
              <TableRow key={interview.id} className={cn(interview.isBlindSpot && 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30')}>
                <TableCell>
                  <div className="font-medium">{interview.isBlindSpot ? interview.anonymizedTitle : interview.title}</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    {interview.isBlindSpot ? interview.anonymizedParticipant : `${interview.participantName} at ${interview.company}`}
                  </div>
                  {interview.isBlindSpot && <Badge variant="outline" className="mt-1 bg-background">Blind Spot</Badge>}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge className="text-xs" variant={interview.status === 'Completed' ? 'default' : 'outline'}>
                    {interview.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {interview.reportType && (
                    <Badge className="text-xs" variant={getReportTypeBadgeVariant(interview.reportType)}>
                      {interview.reportType}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {interview.outcome && (
                    <Badge className="text-xs" variant={getOutcomeBadgeVariant(interview.outcome)}>
                      {interview.outcome}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {interview.report?.competitorsMentioned.slice(0, 2).map(c => (
                      <Badge key={c.id} variant="secondary">{c.name}</Badge>
                    ))}
                    {interview.report && interview.report.competitorsMentioned.length > 2 && (
                      <Badge variant="outline">+{interview.report.competitorsMentioned.length - 2}</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{formatDate(interview.date, 'MMM d, yyyy')}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  {['Won', 'Lost', 'Churn', 'Renew'].includes(interview.outcome || '')
                    ? formatDate(interview.date, 'MMM d, yyyy')
                    : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  {interview.isBlindSpot ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          onClick={() => toast.info('This would initiate a purchase to unlock the report.')}
                          className="bg-gradient-unlock text-primary-foreground hover:opacity-90"
                        >
                          <Lock className="mr-2 h-3 w-3" />
                          Unlock Report
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Learn from a deal you weren't even in.</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Button asChild variant="outline" size="sm" disabled={!interview.report}>
                      <Link to={`/interview/${interview.id}`}>View Report</Link>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">No interviews found for the selected filters.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
}