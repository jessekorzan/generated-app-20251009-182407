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
import { api } from "@/lib/api-client"
import { Skeleton } from "./ui/skeleton"
import { Program } from "@shared/types"
export function ProgramFilter() {
  const [open, setOpen] = React.useState(false)
  const [programs, setPrograms] = React.useState<Program[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { selectedProgramIds, setSelectedProgramIds } = useGlobalFiltersStore();
  React.useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const data = await api<Program[]>('/api/programs');
        setPrograms(data);
      } catch (error) {
        console.error("Failed to fetch programs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, []);
  const handleSelect = (programId: string) => {
    const newSelection = selectedProgramIds.includes(programId)
      ? selectedProgramIds.filter(id => id !== programId)
      : [...selectedProgramIds, programId];
    setSelectedProgramIds(newSelection);
  };
  if (loading) {
    return <Skeleton className="h-10 w-full sm:w-[250px]" />;
  }
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
            {selectedProgramIds.length > 0 ? `${selectedProgramIds.length} programs selected` : "Filter by program..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No programs found.</CommandEmpty>
            <CommandGroup>
              {programs.map((program) => (
                <CommandItem
                  key={program.id}
                  value={program.name}
                  onSelect={() => handleSelect(program.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedProgramIds.includes(program.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {program.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        {selectedProgramIds.length > 0 && (
          <div className="p-2 border-t">
            <div className="flex flex-wrap gap-1">
              {selectedProgramIds.map(programId => {
                const program = programs.find(p => p.id === programId);
                return program ? (
                  <Badge
                    key={program.id}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {program.name}
                    <button
                      onClick={() => handleSelect(program.id)}
                      className="rounded-full hover:bg-muted-foreground/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ) : null;
              })}
            </div>
            <Button
              variant="link"
              size="sm"
              className="w-full mt-2 h-auto p-1"
              onClick={() => setSelectedProgramIds([])}
            >
              Clear all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}