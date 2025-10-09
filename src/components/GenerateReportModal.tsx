import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import { Interview, Prompt, AggregateReport, InterviewOutcome } from '@shared/types';
import { toast } from 'sonner';
import { useGlobalFiltersStore } from '@/stores/useGlobalFiltersStore';
import { ChevronsUpDown } from 'lucide-react';
interface GenerateReportModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  initialPromptId?: string;
  initialOutcomeFilter?: InterviewOutcome[];
}
export function GenerateReportModal({ isOpen, onOpenChange, initialPromptId, initialOutcomeFilter }: GenerateReportModalProps) {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedInterviewIds, setSelectedInterviewIds] = useState<Set<string>>(new Set());
  const [selectedPromptId, setSelectedPromptId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInterviewListOpen, setIsInterviewListOpen] = useState(false);
  const { dateRange, selectedCompetitors, selectedOutcomes, selectedProgramIds } = useGlobalFiltersStore();
  useEffect(() => {
    if (isOpen) {
      // Pre-select prompt if provided by quick action
      if (initialPromptId) {
        setSelectedPromptId(initialPromptId);
      } else {
        setSelectedPromptId('');
      }
      const fetchData = async () => {
        try {
          setLoading(true);
          const params = {
            from: dateRange?.from?.toISOString(),
            to: dateRange?.to?.toISOString(),
            competitors: selectedCompetitors,
            // Use initial outcome filter if provided, otherwise use global filter
            outcomes: initialOutcomeFilter || selectedOutcomes,
            programIds: selectedProgramIds,
          };
          const [interviewsData, promptsData] = await Promise.all([
            api<Interview[]>('/api/interviews', undefined, params),
            api<Prompt[]>('/api/prompts'),
          ]);
          const completedInterviews = interviewsData.filter(i => i.status === 'Completed');
          setInterviews(completedInterviews);
          setPrompts(promptsData);
          // Select all by default
          setSelectedInterviewIds(new Set(completedInterviews.map(i => i.id)));
          setIsInterviewListOpen(false); // Collapse by default
        } catch (error) {
          console.error('Failed to fetch data for report generation:', error);
          toast.error('Failed to load necessary data.');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, dateRange, selectedCompetitors, selectedOutcomes, selectedProgramIds, initialPromptId, initialOutcomeFilter]);
  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      const allIds = new Set(interviews.map(i => i.id));
      setSelectedInterviewIds(allIds);
    } else {
      setSelectedInterviewIds(new Set());
    }
  };
  const handleInterviewSelect = (interviewId: string, checked: boolean) => {
    const newSet = new Set(selectedInterviewIds);
    if (checked) {
      newSet.add(interviewId);
    } else {
      newSet.delete(interviewId);
    }
    setSelectedInterviewIds(newSet);
  };
  const handleGenerate = async () => {
    if (selectedInterviewIds.size === 0 || !selectedPromptId) {
      toast.warning('Please select at least one interview and a prompt.');
      return;
    }
    setIsGenerating(true);
    try {
      const payload = {
        interviewIds: Array.from(selectedInterviewIds),
        promptId: selectedPromptId,
      };
      const newReport = await api<AggregateReport>('/api/reports/generate', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      toast.success('Report generated successfully!');
      onOpenChange(false);
      navigate(`/reports/aggregate/${newReport.id}`);
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report.');
    } finally {
      setIsGenerating(false);
    }
  };
  const getSelectAllState = (): boolean | 'indeterminate' => {
    if (interviews.length === 0) return false;
    if (selectedInterviewIds.size === 0) return false;
    if (selectedInterviewIds.size === interviews.length) return true;
    return 'indeterminate';
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Aggregate Report</DialogTitle>
          <DialogDescription>
            Select interviews and a prompt to generate a consolidated report.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="interviews">Select Interviews</Label>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <Collapsible open={isInterviewListOpen} onOpenChange={setIsInterviewListOpen} className="space-y-2">
                <div className="flex items-center justify-between rounded-md border p-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      onCheckedChange={handleSelectAll}
                      checked={getSelectAllState()}
                      disabled={interviews.length === 0}
                    />
                    <Label htmlFor="select-all" className="font-medium">
                      {selectedInterviewIds.size} of {interviews.length} interviews selected
                    </Label>
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-9 p-0">
                      <ChevronsUpDown className="h-4 w-4" />
                      <span className="sr-only">Toggle</span>
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <ScrollArea className="h-64 w-full rounded-md border p-4">
                    <div className="space-y-2">
                      {interviews.length > 0 ? interviews.map(interview => (
                        <div key={interview.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={interview.id}
                            checked={selectedInterviewIds.has(interview.id)}
                            onCheckedChange={(checked) => handleInterviewSelect(interview.id, !!checked)}
                          />
                          <Label htmlFor={interview.id} className="font-normal w-full cursor-pointer">
                            {interview.title} ({interview.company})
                          </Label>
                        </div>
                      )) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No completed interviews match the current filters.</p>
                      )}
                    </div>
                  </ScrollArea>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
          <div className="space-y-3">
            <Label htmlFor="prompt">Select Prompt</Label>
            {loading ? <Skeleton className="h-10 w-full" /> : (
              <Select value={selectedPromptId} onValueChange={setSelectedPromptId}>
                <SelectTrigger id="prompt">
                  <SelectValue placeholder="Choose a prompt..." />
                </SelectTrigger>
                <SelectContent>
                  {prompts.map(prompt => (
                    <SelectItem key={prompt.id} value={prompt.id}>
                      {prompt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleGenerate} disabled={isGenerating || loading}>
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}