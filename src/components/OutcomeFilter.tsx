import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { useGlobalFiltersStore } from "@/stores/useGlobalFiltersStore"
import { InterviewOutcome } from "@shared/types"
const OUTCOMES: InterviewOutcome[] = ['Won', 'Lost', 'Churn', 'Renew', 'No Decision'];
export function OutcomeFilter() {
  const [open, setOpen] = React.useState(false)
  const { selectedOutcomes, setSelectedOutcomes } = useGlobalFiltersStore();
  const handleSelect = (outcome: InterviewOutcome) => {
    const newSelection = selectedOutcomes.includes(outcome)
      ? selectedOutcomes.filter(o => o !== outcome)
      : [...selectedOutcomes, outcome];
    setSelectedOutcomes(newSelection);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full sm:w-[250px] justify-between"
        >
          <span className="truncate">
            {selectedOutcomes.length > 0 ? `${selectedOutcomes.length} outcomes selected` : "Filter by outcome..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {OUTCOMES.map((outcome) => (
                <CommandItem
                  key={outcome}
                  value={outcome}
                  onSelect={() => handleSelect(outcome)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedOutcomes.includes(outcome) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {outcome}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        {selectedOutcomes.length > 0 && (
          <div className="p-2 border-t">
            <div className="flex flex-wrap gap-1">
              {selectedOutcomes.map(outcome => (
                <Badge
                  key={outcome}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {outcome}
                  <button
                    onClick={() => handleSelect(outcome)}
                    className="rounded-full hover:bg-muted-foreground/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Button
              variant="link"
              size="sm"
              className="w-full mt-2 h-auto p-1"
              onClick={() => setSelectedOutcomes([])}
            >
              Clear all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}