import * as React from "react"
import { format, subMonths, subQuarters, startOfToday, endOfToday } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useGlobalFiltersStore } from "@/stores/useGlobalFiltersStore"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
export function DateRangePicker({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const { dateRange, setDateRange } = useGlobalFiltersStore();
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const handleQuickSelect = (months: number) => {
    const to = endOfToday();
    const from = subMonths(to, months);
    setDateRange({ from, to });
  };
  const handleQuarterSelect = (quarters: number) => {
    const to = endOfToday();
    const from = subQuarters(to, quarters);
    setDateRange({ from, to });
  };
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full sm:w-[300px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>All Time</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Tabs defaultValue="custom" className="w-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="custom">Custom Range</TabsTrigger>
              <TabsTrigger value="quick">Quick Picks</TabsTrigger>
            </TabsList>
            <TabsContent value="custom">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range);
                  if (range?.from && range?.to) {
                    setPopoverOpen(false);
                  }
                }}
                numberOfMonths={2}
              />
            </TabsContent>
            <TabsContent value="quick">
              <div className="flex flex-col space-y-2 p-3">
                <Button onClick={() => handleQuickSelect(1)} variant="ghost" className="w-full justify-start">Past Month</Button>
                <Button onClick={() => handleQuarterSelect(1)} variant="ghost" className="w-full justify-start">Past Quarter</Button>
                <Button onClick={() => handleQuickSelect(6)} variant="ghost" className="w-full justify-start">Past 6 Months</Button>
                <Button onClick={() => handleQuickSelect(12)} variant="ghost" className="w-full justify-start">Past 12 Months</Button>
                <Button
                  onClick={() => {
                    setDateRange(undefined);
                    setPopoverOpen(false);
                  }}
                  variant="ghost"
                  className="w-full justify-start"
                >
                  View All Time
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
    </div>
  )
}