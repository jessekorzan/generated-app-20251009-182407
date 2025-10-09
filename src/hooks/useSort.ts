import { useMemo, useState } from 'react';
type SortDirection = 'asc' | 'desc';
interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}
export function useSort<T>(items: T[], initialConfig?: SortConfig<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(initialConfig || null);
  const sortedItems = useMemo(() => {
    if (!sortConfig) {
      return items;
    }
    const sorted = [...items].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }, [items, sortConfig]);
  const requestSort = (key: keyof T) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  return { items: sortedItems, requestSort, sortConfig };
}