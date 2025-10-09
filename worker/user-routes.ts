import { Hono } from "hono";
import type { Env } from './core-utils';
import { InterviewEntity, PromptEntity, AggregateReportEntity, ProgramEntity, UserEntity } from "./entities";
import { ok, notFound, bad } from './core-utils';
import { Prompt, AggregateReport, Interview, InterviewOutcome, User, DashboardQuote, ThemeCategory } from "@shared/types";
import { parseISO, isWithinInterval, subMonths, endOfToday, startOfMonth, format } from 'date-fns';
const applyFilters = (
  items: Interview[],
  query: {
    from?: string;
    to?: string;
    competitors?: string;
    outcomes?: string;
    programIds?: string;
    upcomingOnly?: string;
  }
): Interview[] => {
  let filtered = items;
  // Upcoming only filter
  if (query.upcomingOnly === 'true') {
    filtered = filtered.filter(item => item.status === 'Scheduled' || item.status === 'In Progress');
  }
  // Date filter
  if (query.from && query.to) {
    try {
      const fromDate = parseISO(query.from);
      const toDate = parseISO(query.to);
      filtered = filtered.filter(item => {
        const itemDate = parseISO(item.date);
        return isWithinInterval(itemDate, { start: fromDate, end: toDate });
      });
    } catch (e) {
      console.error("Invalid date format for filtering:", e);
    }
  }
  // Competitor filter - Updated to handle blind spot interviews
  if (query.competitors) {
    const competitorList = query.competitors.split(',').filter(c => c.trim() !== '').map(c => c.toLowerCase());
    if (competitorList.length > 0) {
      filtered = filtered.filter(interview => {
        if (interview.isBlindSpot) {
          // For blind spot interviews, check the anonymized title
          return competitorList.some(competitor =>
            interview.anonymizedTitle?.toLowerCase().includes(competitor)
          );
        } else {
          // For regular interviews, check the report data
          return interview.report?.competitorsMentioned.some(c =>
            competitorList.includes(c.name.toLowerCase())
          );
        }
      });
    }
  }
  // Outcome filter
  if (query.outcomes) {
    const outcomeList = query.outcomes.split(',') as InterviewOutcome[];
    if (outcomeList.length > 0) {
      filtered = filtered.filter(interview =>
        interview.outcome && outcomeList.includes(interview.outcome)
      );
    }
  }
  // Program filter
  if (query.programIds) {
    const programIdList = query.programIds.split(',');
    if (programIdList.length > 0) {
      filtered = filtered.filter(interview =>
        interview.programId && programIdList.includes(interview.programId)
      );
    }
  }
  return filtered;
};
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.use('/api/*', async (c, next) => {
    await InterviewEntity.ensureSeed(c.env);
    await PromptEntity.ensureSeed(c.env);
    await ProgramEntity.ensureSeed(c.env);
    await UserEntity.ensureSeed(c.env);
    await next();
  });
  app.get('/api/programs', async (c) => {
    const { items } = await ProgramEntity.list(c.env);
    return ok(c, items);
  });
  app.get('/api/competitors', async (c) => {
    const { items } = await InterviewEntity.list(c.env);
    const competitorSet = new Set<string>();
    items.forEach(interview => {
      interview.report?.competitorsMentioned.forEach(competitor => {
        competitorSet.add(competitor.name);
      });
    });
    return ok(c, Array.from(competitorSet).sort());
  });
  app.get('/api/dashboard/stats', async (c) => {
    const { items } = await InterviewEntity.list(c.env);
    // Dashboard stats are now always for the last 6 months, ignoring global filters
    const sixMonthsAgo = subMonths(endOfToday(), 6);
    const lastSixMonthsItems = items.filter(item => isWithinInterval(parseISO(item.date), { start: sixMonthsAgo, end: endOfToday() }));
    const totalInterviews = lastSixMonthsItems.length;
    const completedInterviews = lastSixMonthsItems.filter(i => i.status === 'Completed').length;
    const wins = lastSixMonthsItems.filter(i => i.outcome === 'Won' || i.outcome === 'Renew').length;
    const losses = lastSixMonthsItems.filter(i => i.outcome === 'Lost' || i.outcome === 'Churn').length;
    const winRate = (wins + losses) > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;
    const competitorCounts: Record<string, number> = {};
    lastSixMonthsItems.forEach(interview => {
      interview.report?.competitorsMentioned.forEach(competitor => {
        competitorCounts[competitor.name] = (competitorCounts[competitor.name] || 0) + 1;
      });
    });
    let topCompetitor = { name: 'N/A', mentionCount: 0 };
    if (Object.keys(competitorCounts).length > 0) {
      const [name, mentionCount] = Object.entries(competitorCounts).reduce((a, b) => a[1] > b[1] ? a : b);
      topCompetitor = { name, mentionCount };
    }
    // Generate chart data for the last 6 months
    const monthlyData: Record<string, { wins: number; losses: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(new Date(), i);
      const monthKey = format(month, 'MMM');
      monthlyData[monthKey] = { wins: 0, losses: 0 };
    }
    lastSixMonthsItems.forEach(interview => {
      const monthKey = format(parseISO(interview.date), 'MMM');
      if (monthlyData[monthKey]) {
        if (interview.outcome === 'Won' || interview.outcome === 'Renew') {
          monthlyData[monthKey].wins++;
        } else if (interview.outcome === 'Lost' || interview.outcome === 'Churn') {
          monthlyData[monthKey].losses++;
        }
      }
    });
    const chartData = Object.entries(monthlyData).map(([name, data]) => ({ name, ...data }));
    const buyerDecisionDrivers = [
      { driver: 'Feature Set', impact: 85 },
      { driver: 'Pricing', impact: 72 },
      { driver: 'Customer Support', impact: 68 },
      { driver: 'User Experience (UX)', impact: 65 },
      { driver: 'Integration Capabilities', impact: 55 },
    ];
    return ok(c, { totalInterviews, completedInterviews, winRate, chartData, keyCompetitor: topCompetitor, buyerDecisionDrivers });
  });
  app.get('/api/dashboard/quotes', async (c) => {
    const { items } = await InterviewEntity.list(c.env);
    const quotes: DashboardQuote[] = items
      .filter(i => i.status === 'Completed' && i.report && i.report.quotes.length > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3) // Take top 3 recent interviews with quotes
      .map(interview => {
        const quote = interview.report!.quotes[0];
        const participantInfo = `${interview.participantName}, ${interview.participantRole} at ${interview.company}`;
        return {
          id: quote.id,
          text: quote.text,
          interviewId: interview.id,
          interviewTitle: interview.title,
          participantInfo: participantInfo,
        };
      });
    return ok(c, quotes);
  });
  app.get('/api/analytics', async (c) => {
    const query = c.req.query();
    console.log(`Analytics requested with filters:`, query);
    const themes: ThemeCategory[] = [
      {
        categoryName: 'Product',
        winReasons: [
          { reason: 'Superior UI/UX', count: 25 },
          { reason: 'Key Feature Availability', count: 18 },
          { reason: 'Platform Reliability', count: 15 },
        ],
        lossReasons: [
          { reason: 'Missing Integration', count: 22 },
          { reason: 'Performance Issues', count: 15 },
          { reason: 'Critical Feature Gap', count: 11 },
        ],
      },
      {
        categoryName: 'Company',
        winReasons: [
          { reason: 'Positive Brand Reputation', count: 19 },
          { reason: 'Strong Customer Support', count: 16 },
          { reason: 'Vision & Roadmap Alignment', count: 12 },
        ],
        lossReasons: [
          { reason: 'Poor Sales Experience', count: 14 },
          { reason: 'Lack of Local Presence', count: 8 },
          { reason: 'Negative Past Experience', count: 5 },
        ],
      },
      {
        categoryName: 'Price',
        winReasons: [
          { reason: 'Transparent Pricing Model', count: 21 },
          { reason: 'Better Overall Value (TCO)', count: 17 },
          { reason: 'Flexible Contract Terms', count: 10 },
        ],
        lossReasons: [
          { reason: 'Higher Upfront Cost', count: 28 },
          { reason: 'Cheaper Alternative Available', count: 20 },
          { reason: 'Unfavorable Contract Terms', count: 9 },
        ],
      },
    ];
    const analyticsData = {
      themes,
      competitorMentions: [
        { name: 'Competitor X', count: 25 }, { name: 'Competitor Y', count: 18 }, { name: 'Competitor Z', count: 12 },
      ],
      productFeedbackSentiment: [
        { feature: 'Dashboard', positive: 85, negative: 10, neutral: 5 }, { feature: 'Reporting', positive: 70, negative: 20, neutral: 10 },
        { feature: 'Integrations', positive: 40, negative: 50, neutral: 10 }, { feature: 'Mobile App', positive: 25, negative: 65, neutral: 10 },
      ],
    };
    return ok(c, analyticsData);
  });
  app.get('/api/interviews', async (c) => {
    const query = c.req.query();
    const { items } = await InterviewEntity.list(c.env);
    let itemsToFilter = items;
    // Special case for the dashboard pipeline widget
    if (query.source === 'dashboard_pipeline') {
      const sixMonthsAgo = subMonths(endOfToday(), 6);
      itemsToFilter = items.filter(interview => {
        const isUpcoming = interview.status === 'Scheduled' || interview.status === 'In Progress';
        const isRecent = isWithinInterval(parseISO(interview.date), { start: sixMonthsAgo, end: endOfToday() });
        return isUpcoming || isRecent;
      });
    }
    const filteredItems = applyFilters(itemsToFilter, query);
    return ok(c, filteredItems);
  });
  app.get('/api/interviews/:id', async (c) => {
    const { id } = c.req.param();
    const interview = new InterviewEntity(c.env, id);
    if (!(await interview.exists())) return notFound(c, 'Interview not found');
    return ok(c, await interview.getState());
  });
  app.get('/api/share/:id', async (c) => {
    const { id } = c.req.param();
    const interview = new InterviewEntity(c.env, id);
    if (!(await interview.exists())) return notFound(c, 'Interview not found');
    return ok(c, await interview.getState());
  });
  app.get('/api/prompts', async (c) => {
    const { items } = await PromptEntity.list(c.env);
    return ok(c, items);
  });
  app.post('/api/prompts', async (c) => {
    const body = await c.req.json<Partial<Prompt>>();
    if (!body.name || !body.description || !body.promptText) return bad(c, 'Missing required fields');
    const newPrompt: Prompt = { id: crypto.randomUUID(), name: body.name, description: body.description, promptText: body.promptText };
    await PromptEntity.create(c.env, newPrompt);
    return ok(c, newPrompt);
  });
  app.put('/api/prompts/:id', async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json<Partial<Prompt>>();
    const prompt = new PromptEntity(c.env, id);
    if (!(await prompt.exists())) return notFound(c, 'Prompt not found');
    await prompt.patch(body);
    return ok(c, await prompt.getState());
  });
  app.delete('/api/prompts/:id', async (c) => {
    const { id } = c.req.param();
    const deleted = await PromptEntity.delete(c.env, id);
    if (!deleted) return notFound(c, 'Prompt not found');
    return ok(c, { id });
  });
  app.post('/api/reports/generate', async (c) => {
    const { interviewIds, promptId } = await c.req.json<{ interviewIds: string[], promptId: string }>();
    if (!interviewIds || interviewIds.length === 0 || !promptId) return bad(c, 'Missing interviewIds or promptId');
    const promptEntity = new PromptEntity(c.env, promptId);
    if (!(await promptEntity.exists())) return notFound(c, 'Prompt not found');
    const prompt = await promptEntity.getState();
    const summary = `This is a simulated executive summary based on ${interviewIds.length} interviews using the "${prompt.name}" prompt. Key themes identified include strong product performance, competitive pricing pressures, and opportunities for market expansion.`;
    const newReport: AggregateReport = {
      id: crypto.randomUUID(),
      title: `${prompt.name} from ${interviewIds.length} interviews`,
      generatedSummary: summary,
      sourceInterviewIds: interviewIds,
      promptId: promptId,
      dateGenerated: new Date().toISOString(),
      reportType: 'AI',
    };
    await AggregateReportEntity.create(c.env, newReport);
    return ok(c, newReport);
  });
  app.get('/api/reports/aggregate', async (c) => {
    const { from, to } = c.req.query();
    const { items } = await AggregateReportEntity.list(c.env);
    let filteredItems = items;
    if (from && to) {
        try {
            const fromDate = parseISO(from);
            const toDate = parseISO(to);
            filteredItems = items.filter(item => {
                const itemDate = parseISO(item.dateGenerated);
                return isWithinInterval(itemDate, { start: fromDate, end: toDate });
            });
        } catch (e) {
            console.error("Invalid date format for filtering aggregate reports:", e);
        }
    }
    return ok(c, filteredItems);
  });
  app.get('/api/reports/aggregate/:id', async (c) => {
    const { id } = c.req.param();
    const report = new AggregateReportEntity(c.env, id);
    if (!(await report.exists())) return notFound(c, 'Aggregate report not found');
    return ok(c, await report.getState());
  });
  app.get('/api/users', async (c) => {
    const { items } = await UserEntity.list(c.env);
    return ok(c, items);
  });
  app.post('/api/users', async (c) => {
    const body = await c.req.json<Partial<User>>();
    if (!body.name || !body.email || !body.role) return bad(c, 'Missing required fields');
    const newUser: User = {
      id: crypto.randomUUID(),
      name: body.name,
      email: body.email,
      role: body.role,
      avatarUrl: `https://i.pravatar.cc/40?u=${crypto.randomUUID()}`,
    };
    await UserEntity.create(c.env, newUser);
    return ok(c, newUser);
  });
  app.get('/api/users/:id', async (c) => {
    const { id } = c.req.param();
    const user = new UserEntity(c.env, id);
    if (!(await user.exists())) return notFound(c, 'User not found');
    return ok(c, await user.getState());
  });
  app.put('/api/users/:id', async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json<Partial<User>>();
    const user = new UserEntity(c.env, id);
    if (!(await user.exists())) {
      return notFound(c, 'User not found');
    }
    await user.patch(body);
    const updatedUser = await user.getState();
    return ok(c, updatedUser);
  });
  app.delete('/api/users/:id', async (c) => {
    const { id } = c.req.param();
    const deleted = await UserEntity.delete(c.env, id);
    if (!deleted) {
      return notFound(c, 'User not found');
    }
    return ok(c, { id });
  });
  app.post('/api/chat', async (c) => {
    const { message } = await c.req.json<{ message: string }>();
    if (!message) return bad(c, 'Message is required');
    // Simulate a delay for a more realistic AI response
    await new Promise(resolve => setTimeout(resolve, 1000));
    const reply = `Based on your question about "${message}", I've analyzed the data. The top loss reason is "Missing Feature", and the most mentioned competitor is "Competitor X". Would you like me to generate a detailed report on this?`;
    return ok(c, { reply });
  });
}