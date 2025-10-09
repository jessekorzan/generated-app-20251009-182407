import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
interface ChangelogItem {
  version: string;
  date: string;
  changes: {
    type: 'New' | 'Improved' | 'Fixed';
    text: string;
  }[];
}
interface WhatIsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ChangelogItem[];
}
const getBadgeVariant = (type: ChangelogItem['changes'][0]['type']) => {
  switch (type) {
    case 'New':
      return 'default';
    case 'Improved':
      return 'secondary';
    case 'Fixed':
      return 'destructive';
    default:
      return 'outline';
  }
};
export function WhatIsNewModal({ isOpen, onClose, items }: WhatIsNewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">What's New in BuyersLens</DialogTitle>
          <DialogDescription>
            Here are the latest features and improvements we've rolled out.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-6 -mr-6">
          <div className="space-y-8 py-4">
            {items.map((item, index) => (
              <div key={item.version}>
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold">{item.version}</h3>
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                </div>
                <ul className="mt-4 space-y-3">
                  {item.changes.map((change, changeIndex) => (
                    <li key={changeIndex} className="flex items-start gap-3">
                      <Badge variant={getBadgeVariant(change.type)} className="mt-1 shrink-0">
                        {change.type}
                      </Badge>
                      <p className="text-sm text-muted-foreground">{change.text}</p>
                    </li>
                  ))}
                </ul>
                {index < items.length - 1 && <Separator className="mt-8" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}