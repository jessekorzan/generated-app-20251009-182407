import { Construction } from 'lucide-react';
export function PlaceholderPage({ pageName }: { pageName: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center bg-muted/40 rounded-lg p-8">
      <div className="p-6 bg-background rounded-full border shadow-sm mb-6">
        <Construction className="w-16 h-16 text-primary" />
      </div>
      <h1 className="text-4xl font-display font-bold mb-2">Coming Soon!</h1>
      <p className="text-lg text-muted-foreground max-w-md">
        The "{pageName}" page is currently under construction. We're working hard to bring you this feature. Please check back later!
      </p>
    </div>
  );
}