import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, FileText, TrendingDown, TrendingUp } from 'lucide-react';
import { InterviewOutcome } from '@shared/types';
export type QuickAction = {
  promptId: string;
  outcomeFilter?: InterviewOutcome[];
};
interface QuickActionsDropdownProps {
  onActionSelect: (action: QuickAction) => void;
}
export function QuickActionsDropdown({ onActionSelect }: QuickActionsDropdownProps) {
  const handleSelect = (promptId: string, outcomeFilter?: InterviewOutcome[]) => {
    onActionSelect({ promptId, outcomeFilter });
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Quick Actions
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Generate Common Reports</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => handleSelect('prompt-4', ['Won', 'Renew'])}>
          <TrendingUp className="mr-2 h-4 w-4" />
          <span>Summarize Win Reasons</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleSelect('prompt-5', ['Lost', 'Churn'])}>
          <TrendingDown className="mr-2 h-4 w-4" />
          <span>Summarize Loss Reasons</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleSelect('prompt-6')}>
          <FileText className="mr-2 h-4 w-4" />
          <span>Quarterly Slides</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}