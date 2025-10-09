import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import { Prompt } from '@shared/types';
import { useGlobalFiltersStore } from '@/stores/useGlobalFiltersStore';
import { toast } from 'sonner';
import { Sparkles, ChevronRight } from 'lucide-react';
const CURATED_PROMPT_NAMES = [
  'Summarize Win Reasons',
  'Summarize Loss Reasons',
  'Competitor Insights',
  'Product Feedback Analysis',
  'Extract Juicy Quotes',
];
export function ThemesPromptWidget() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const { setShowChatUI, setChatInitialMessage } = useGlobalFiltersStore();
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setLoading(true);
        const allPrompts = await api<Prompt[]>('/api/prompts');
        const curatedPrompts = allPrompts.filter(p => CURATED_PROMPT_NAMES.includes(p.name));
        setPrompts(curatedPrompts);
      } catch (error) {
        console.error("Failed to fetch prompts for widget:", error);
        toast.error('Could not load suggested prompts.');
      } finally {
        setLoading(false);
      }
    };
    fetchPrompts();
  }, []);
  const handlePromptClick = (prompt: Prompt) => {
    setShowChatUI(true);
    setChatInitialMessage(prompt.promptText);
  };
  return (
    <Card className="bg-muted/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>Generate Thematic Reports</span>
        </CardTitle>
        <CardDescription>
          Use these curated prompts to quickly generate reports on key themes from your filtered data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))
          ) : (
            prompts.map(prompt => (
              <button
                key={prompt.id}
                onClick={() => handlePromptClick(prompt)}
                className="group flex flex-col justify-between text-left p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-semibold">{prompt.name}</p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{prompt.description}</p>
                </div>
                <div className="flex items-center justify-end text-primary mt-2">
                  <span className="text-sm font-medium">Generate</span>
                  <ChevronRight className="h-4 w-4 ml-1 transform transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}