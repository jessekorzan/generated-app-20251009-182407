import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Sidebar } from './Sidebar'; // For mobile view trigger
import { DateRangePicker } from '../DateRangePicker';
import { CompetitorFilter } from '../CompetitorFilter';
import { OutcomeFilter } from '../OutcomeFilter';
import { ProgramFilter } from '../ProgramFilter';
import { QuickAction, QuickActionsDropdown } from '../QuickActionsDropdown';
import { FilterX } from 'lucide-react';
import { useGlobalFiltersStore } from '@/stores/useGlobalFiltersStore';
interface HeaderProps {
  title: string;
  breadcrumbs: { label: string; href?: string }[];
  primaryAction?: { label: string; onClick: () => void; icon?: React.ElementType };
  secondaryAction?: { label: string; onClick: () => void; icon?: React.ElementType };
  onQuickActionSelect?: (action: QuickAction) => void;
  showFilters?: boolean;
}
export function Header({ title, breadcrumbs, primaryAction, secondaryAction, onQuickActionSelect, showFilters = false }: HeaderProps) {
  const { clearAllFilters } = useGlobalFiltersStore();
  return (
    <header className="sticky top-0 z-30 flex h-auto flex-col gap-4 border-b bg-background px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <Sidebar />
          </div>
          <div className="flex-1">
            <Breadcrumb className="hidden md:flex">
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    <BreadcrumbItem>
                      {crumb.href ? (
                        <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display mt-2">{title}</h1>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.icon && <secondaryAction.icon className="mr-2 h-4 w-4" />}
              {secondaryAction.label}
            </Button>
          )}
          {onQuickActionSelect && <QuickActionsDropdown onActionSelect={onQuickActionSelect} />}
          {primaryAction && (
            <Button onClick={primaryAction.onClick}>
              {primaryAction.icon && <primaryAction.icon className="mr-2 h-4 w-4" />}
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>
      {showFilters && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row gap-2 w-full items-center">
            <DateRangePicker />
            <CompetitorFilter />
            <OutcomeFilter />
            <ProgramFilter />
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-muted-foreground">
              <FilterX className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>
        </div>
      )}
      <div className="flex md:hidden items-center gap-2 w-full sm:w-auto">
        {secondaryAction && (
          <Button variant="outline" onClick={secondaryAction.onClick} size="sm" className="flex-1">
            {secondaryAction.icon && <secondaryAction.icon className="mr-2 h-4 w-4" />}
            {secondaryAction.label}
          </Button>
        )}
        {primaryAction && (
          <Button onClick={primaryAction.onClick} size="sm" className="flex-1">
            {primaryAction.icon && <primaryAction.icon className="mr-2 h-4 w-4" />}
            {primaryAction.label}
          </Button>
        )}
      </div>
    </header>
  );
}