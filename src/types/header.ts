import React from 'react';
import { QuickAction } from '@/components/QuickActionsDropdown';
export interface HeaderConfig {
  title: string;
  breadcrumbs: { label: string; href?: string }[];
  primaryAction?: { label: string; onClick: () => void; icon?: React.ElementType };
  secondaryAction?: { label: string; onClick: () => void; icon?: React.ElementType };
  onQuickActionSelect?: (action: QuickAction) => void;
  showFilters?: boolean;
}
export type SetHeaderConfig = (config: Partial<HeaderConfig>) => void;
export interface OutletContextType {
  setHeaderConfig: SetHeaderConfig;
}