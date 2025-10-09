import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeCategory, ThemeReason } from '@shared/types';
import { Separator } from './ui/separator';
interface ThemeCategoryCardProps {
  theme: ThemeCategory;
}
const ReasonBar = ({ reason, maxCount }: { reason: ThemeReason; maxCount: number }) => {
  const widthPercentage = maxCount > 0 ? (reason.count / maxCount) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground truncate pr-2">{reason.reason}</span>
        <span className="font-medium">{reason.count}</span>
      </div>
      <div className="w-full bg-muted rounded-full h-1.5">
        <div
          className="bg-primary h-1.5 rounded-full"
          style={{ width: `${widthPercentage}%` }}
        />
      </div>
    </div>
  );
};
export function ThemeCategoryCard({ theme }: ThemeCategoryCardProps) {
  const allReasons = [...theme.winReasons, ...theme.lossReasons];
  const maxCount = allReasons.length > 0 ? Math.max(...allReasons.map(r => r.count)) : 0;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{theme.categoryName}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-center md:text-left">Win Reasons</h4>
          <Separator />
          <div className="space-y-4">
            {theme.winReasons.length > 0 ? (
              theme.winReasons.map((reason, index) => (
                <ReasonBar key={`win-${index}`} reason={reason} maxCount={maxCount} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center md:text-left">No win reasons in this category.</p>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="font-semibold text-center md:text-left">Loss Reasons</h4>
          <Separator />
          <div className="space-y-4">
            {theme.lossReasons.length > 0 ? (
              theme.lossReasons.map((reason, index) => (
                <ReasonBar key={`loss-${index}`} reason={reason} maxCount={maxCount} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center md:text-left">No loss reasons in this category.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}