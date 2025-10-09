import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Send } from 'lucide-react';
import { useGlobalFiltersStore } from '@/stores/useGlobalFiltersStore';
import { api } from '@/lib/api-client';
import { InterviewOutcome } from '@shared/types';
type ShowOption = 'all' | 'wins' | 'losses' | 'churn' | 'renew';
type WhereOption = 'any' | 'competitor' | 'mentions';
type MentionsCategory = 'product' | 'pricing' | 'people' | 'process' | 'competition';
const MENTION_TAGS: Record<MentionsCategory, string[]> = {
  product: ['Feature Gap', 'UX/UI', 'Reliability'],
  pricing: ['Too Expensive', 'Good Value', 'Complex Pricing'],
  people: ['Sales Experience', 'Support', 'Implementation Team'],
  process: ['Onboarding', 'Procurement', 'Communication'],
  competition: ['Legacy System', 'Better Alternative', 'No Competition'],
};
export function PromptBuilder() {
  const navigate = useNavigate();
  const { setSelectedCompetitors, setSelectedOutcomes, clearAllFilters } = useGlobalFiltersStore();
  const [show, setShow] = useState<ShowOption>('all');
  const [where, setWhere] = useState<WhereOption>('any');
  const [competitor, setCompetitor] = useState<string>('');
  const [mentionsCategory, setMentionsCategory] = useState<MentionsCategory | ''>('');
  const [mentionTag, setMentionTag] = useState<string>('');
  const [competitorsList, setCompetitorsList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api<string[]>('/api/competitors')
      .then(setCompetitorsList)
      .catch(err => console.error("Failed to fetch competitors", err))
      .finally(() => setLoading(false));
  }, []);
  const generatedPrompt = useMemo(() => {
    let prompt = `Show me ${show.replace('all', 'all interviews')}`;
    if (where === 'competitor' && competitor) {
      prompt += ` where competitor ${competitor} was mentioned`;
    } else if (where === 'mentions' && mentionsCategory && mentionTag) {
      prompt += ` that mention ${mentionsCategory} tag: ${mentionTag}`;
    }
    return prompt;
  }, [show, where, competitor, mentionsCategory, mentionTag]);
  const handleReset = () => {
    setShow('all');
    setWhere('any');
    setCompetitor('');
    setMentionsCategory('');
    setMentionTag('');
    clearAllFilters();
  };
  const handleSubmit = () => {
    clearAllFilters();
    const outcomes: InterviewOutcome[] = [];
    if (show === 'wins') outcomes.push('Won', 'Renew');
    if (show === 'losses') outcomes.push('Lost');
    if (show === 'churn') outcomes.push('Churn');
    if (show === 'renew') outcomes.push('Renew');
    if (outcomes.length > 0) {
      setSelectedOutcomes(outcomes);
    }
    if (where === 'competitor' && competitor) {
      setSelectedCompetitors([competitor]);
    }
    // Note: 'mentions' filtering is not yet implemented in backend, so it's UI only for now.
    navigate('/reports');
  };
  const handleQuickLink = (competitorName: string, outcome: ShowOption) => {
    setShow(outcome);
    setWhere('competitor');
    setCompetitor(competitorName);
    setMentionsCategory('');
    setMentionTag('');
  };
  useEffect(() => {
    setCompetitor('');
    setMentionsCategory('');
  }, [where]);
  useEffect(() => {
    setMentionTag('');
  }, [mentionsCategory]);
  const handleShowChange = useCallback((v: string) => setShow(v as ShowOption), []);
  const handleWhereChange = useCallback((v: string) => setWhere(v as WhereOption), []);
  const handleCompetitorChange = useCallback((v: string) => setCompetitor(v), []);
  const handleMentionsCategoryChange = useCallback((v: string) => setMentionsCategory(v as MentionsCategory), []);
  const handleMentionTagChange = useCallback((v: string) => setMentionTag(v), []);
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-4xl font-display font-bold">Hello again, Liam</h2>
        <p className="text-lg text-muted-foreground mt-1">What are your buyers saying?</p>
      </div>
      <div className="bg-background/80 p-4 rounded-lg shadow-sm border flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-foreground flex-1 truncate text-center sm:text-left">{generatedPrompt}</span>
        <div className="flex items-center gap-2">
          <Button size="icon" onClick={handleSubmit} className="rounded-full w-10 h-10">
            <Send className="h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={handleReset}>Reset</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">Show</label>
          <Select value={show} onValueChange={handleShowChange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All interviews</SelectItem>
              <SelectItem value="wins">All wins</SelectItem>
              <SelectItem value="losses">All losses</SelectItem>
              <SelectItem value="churn">All churn</SelectItem>
              <SelectItem value="renew">All renews</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">Where</label>
          <Select value={where} onValueChange={handleWhereChange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any condition</SelectItem>
              <SelectItem value="competitor">Competitor was mentioned</SelectItem>
              <SelectItem value="mentions">Mentions...</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {where === 'competitor' && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Competitor</label>
            <Select value={competitor} onValueChange={handleCompetitorChange} disabled={loading}>
              <SelectTrigger><SelectValue placeholder={loading ? "Loading..." : "Select..."} /></SelectTrigger>
              <SelectContent>
                {competitorsList.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
        {where === 'mentions' && (
          <>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Category</label>
              <Select value={mentionsCategory} onValueChange={handleMentionsCategoryChange}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {Object.keys(MENTION_TAGS).map(cat => <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {mentionsCategory && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Specific Tag</label>
                <Select value={mentionTag} onValueChange={handleMentionTagChange} disabled={!mentionsCategory}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {MENTION_TAGS[mentionsCategory].map(tag => <SelectItem key={tag} value={tag}>{tag}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}
      </div>
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <Button variant="link" onClick={() => handleQuickLink('Webex', 'wins')}>Wins vs. Webex</Button>
        <Button variant="link" onClick={() => handleQuickLink('Microsoft Teams', 'losses')}>Losses vs MS Teams</Button>
        <Button variant="link" onClick={() => handleQuickLink('Google Meet', 'all')}>Google Meet Mentions</Button>
      </div>
    </div>
  );
}