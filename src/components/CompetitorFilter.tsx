import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
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
import { api } from "@/lib/api-client"
import { Skeleton } from "./ui/skeleton"
export function CompetitorFilter() {
  const [open, setOpen] = React.useState(false)
  const [competitors, setCompetitors] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { selectedCompetitors, setSelectedCompetitors } = useGlobalFiltersStore();
  React.useEffect(() => {
    const fetchCompetitors = async () => {
      try {
        setLoading(true);
        const data = await api<string[]>('/api/competitors');
        setCompetitors(data);
      } catch (error) {
        console.error("Failed to fetch competitors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompetitors();
  }, []);
  const handleSelect = (competitor: string) => {
    const newSelection = selectedCompetitors.includes(competitor)
      ? selectedCompetitors.filter(c => c !== competitor)
      : [...selectedCompetitors, competitor];
    setSelectedCompetitors(newSelection);
  };
  if (loading) {
    return <Skeleton className="h-10 w-[250px]" />;
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[250px] justify-between"
        >
          <span className="truncate">
            {selectedCompetitors.length > 0 ? `${selectedCompetitors.length} selected` : "Filter by competitor..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search competitor..." />
          <CommandList>
            <CommandEmpty>No competitor found.</CommandEmpty>
            <CommandGroup>
              {competitors.map((competitor) => (
                <CommandItem
                  key={competitor}
                  value={competitor}
                  onSelect={() => handleSelect(competitor)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCompetitors.includes(competitor) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {competitor}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        {selectedCompetitors.length > 0 && (
          <div className="p-2 border-t">
            <div className="flex flex-wrap gap-1">
              {selectedCompetitors.map(competitor => (
                <Badge
                  key={competitor}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {competitor}
                  <button
                    onClick={() => handleSelect(competitor)}
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
              onClick={() => setSelectedCompetitors([])}
            >
              Clear all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}