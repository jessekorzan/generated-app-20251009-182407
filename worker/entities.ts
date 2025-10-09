import { IndexedEntity } from "./core-utils";
import type { Interview, Prompt, AggregateReport, Program, InterviewOutcome, InterviewStatus, User, UserRole, ReportType } from "@shared/types";
const MOCK_PROGRAMS: Program[] = [
    { id: 'prog-1', name: 'Win/Loss Analysis Q2 2023' },
    { id: 'prog-2', name: 'Enterprise Churn Study' },
    { id: 'prog-3', name: 'Mid-Market Competitive' },
];
// Mock data is now self-contained within the worker entities to resolve build errors.
const MOCK_INTERVIEWS_BASE: Interview[] = [
  {
    id: 'interview-1',
    title: 'Win Analysis vs. Competitor X',
    participantName: 'Jane Doe',
    participantRole: 'Marketing Director',
    company: 'Innovate Inc.',
    date: '2023-05-15T10:00:00.000Z',
    status: 'Completed',
    outcome: 'Won',
    programId: 'prog-1',
    reportType: 'Human',
    report: {
      id: 'report-1',
      interviewId: 'interview-1',
      summary: 'The interview with Jane Doe from Innovate Inc. revealed that our superior user interface and dedicated customer support were the key deciding factors. Competitor X was perceived as having a clunky and outdated platform, although their pricing was slightly more aggressive. Key opportunities lie in leveraging our UX advantage in marketing materials.',
      keyTakeaways: [
        { id: 'kt-1-1', text: 'User interface was a major differentiator.', category: 'Strength' },
        { id: 'kt-1-2', text: 'Competitor X has aggressive, potentially unsustainable pricing.', category: 'Threat' },
        { id: 'kt-1-3', text: 'Customer support experience sealed the deal.', category: 'Strength' },
        { id: 'kt-1-4', text: 'Opportunity to create case studies focused on ease-of-use.', category: 'Opportunity' },
      ],
      quotes: [
        { id: 'q-1-1', text: "Your platform just felt intuitive from the first click. We were up and running in minutes, not days.", attribution: 'Jane Doe' },
        { id: 'q-1-2', text: "We felt like we'd have a real partner with your support team, not just another ticket number.", attribution: 'Jane Doe' },
      ],
      competitorsMentioned: [
        { id: 'comp-x', name: 'Competitor X' },
        { id: 'comp-y', name: 'Competitor Y' },
      ],
      productFeedback: [
        { id: 'pf-1-1', feature: 'Dashboard Analytics', sentiment: 'Positive', comment: 'The main dashboard is incredibly insightful.' },
        { id: 'pf-1-2', feature: 'Mobile App', sentiment: 'Negative', comment: 'The mobile experience feels like an afterthought and is difficult to navigate.' },
      ],
      tags: [
        { id: 'tag-win', name: 'Win', color: 'blue' },
        { id: 'tag-ux', name: 'UX/UI', color: 'blue' },
        { id: 'tag-enterprise', name: 'Enterprise', color: 'purple' },
      ],
    },
  },
  {
    id: 'interview-2',
    title: 'Loss Analysis for Acme Corp Deal',
    participantName: 'John Smith',
    participantRole: 'VP of Operations',
    company: 'Acme Corp.',
    date: '2023-05-12T14:30:00.000Z',
    status: 'Completed',
    outcome: 'Lost',
    programId: 'prog-1',
    reportType: 'Human',
    report: {
      id: 'report-2',
      interviewId: 'interview-2',
      summary: 'Acme Corp chose Competitor Z primarily due to a key feature integration (Salesforce) that we currently lack. The participant expressed strong interest in our platform but noted this was a "must-have" requirement. Price was not the main objection. This highlights a critical product gap for enterprise customers in the sales vertical.',
      keyTakeaways: [
        { id: 'kt-2-1', text: 'Lack of Salesforce integration was the deal-breaker.', category: 'Weakness' },
        { id: 'kt-2-2', text: 'Our core feature set was viewed favorably.', category: 'Strength' },
        { id: 'kt-2-3', text: 'High risk of losing similar deals without closing this feature gap.', category: 'Threat' },
      ],
      quotes: [
        { id: 'q-2-1', text: "Honestly, if you had the Salesforce integration, we would have signed with you yesterday.", attribution: 'John Smith' },
      ],
      competitorsMentioned: [
        { id: 'comp-z', name: 'Competitor Z' },
      ],
      productFeedback: [
        { id: 'pf-2-1', feature: 'Integrations', sentiment: 'Negative', comment: 'The lack of a native Salesforce integration is a major gap for our workflow.' },
        { id: 'pf-2-2', feature: 'Reporting Suite', sentiment: 'Positive', comment: 'Your reporting capabilities are far superior to the competition.' },
      ],
      tags: [
        { id: 'tag-loss', name: 'Loss', color: 'red' },
        { id: 'tag-feature-gap', name: 'Feature Gap', color: 'yellow' },
        { id: 'tag-enterprise', name: 'Enterprise', color: 'purple' },
      ],
    },
  },
  {
    id: 'interview-3',
    title: 'Mid-Market Win vs Legacy Solution',
    participantName: 'Emily White',
    participantRole: 'Project Manager',
    company: 'Solutions LLC',
    date: '2023-05-10T11:00:00.000Z',
    status: 'Completed',
    outcome: 'Won',
    programId: 'prog-3',
    reportType: 'Human',
    report: {
      id: 'report-3',
      interviewId: 'interview-3',
      summary: 'Solutions LLC switched from a legacy provider due to our platform\'s flexibility and modern API. They are a technically savvy team and plan to build custom integrations. The legacy solution was too rigid and costly to maintain. This represents a strong growth vector in tech-forward mid-market companies.',
      keyTakeaways: [
        { id: 'kt-3-1', text: 'Modern API and flexibility were key selling points.', category: 'Strength' },
        { id: 'kt-3-2', text: 'Targeting companies moving off legacy systems is a viable strategy.', category: 'Opportunity' },
      ],
      quotes: [
        { id: 'q-3-1', text: "We needed a tool that could grow with us, not hold us back. Your API was the answer.", attribution: 'Emily White' },
      ],
      competitorsMentioned: [],
      productFeedback: [
        { id: 'pf-3-1', feature: 'API Documentation', sentiment: 'Positive', comment: 'The developer documentation is excellent and easy to follow.' },
      ],
      tags: [
        { id: 'tag-win', name: 'Win', color: 'blue' },
        { id: 'tag-api', name: 'API/Integration', color: 'blue' },
        { id: 'tag-mid-market', name: 'Mid-Market', color: 'gray' },
      ],
    },
  },
  {
    id: 'interview-4',
    title: 'Scheduled Call with FutureWave',
    participantName: 'Michael Brown',
    participantRole: 'CTO',
    company: 'FutureWave',
    date: '2023-06-01T09:00:00.000Z',
    status: 'Scheduled',
    outcome: 'No Decision',
    programId: 'prog-1',
    reportType: 'Human',
  },
  {
    id: 'interview-5',
    title: 'Follow-up on Q2 Performance',
    participantName: 'Sarah Green',
    participantRole: 'PMM',
    company: 'DataDriven Co',
    date: '2023-06-05T13:00:00.000Z',
    status: 'In Progress',
    outcome: 'No Decision',
    programId: 'prog-2',
    reportType: 'Human',
  },
  {
    id: 'interview-6',
    title: 'Churn Analysis - OldGuard Inc.',
    participantName: 'Robert Paulson',
    participantRole: 'IT Manager',
    company: 'OldGuard Inc.',
    date: '2023-04-20T10:00:00.000Z',
    status: 'Completed',
    outcome: 'Churn',
    programId: 'prog-2',
    reportType: 'Human',
    report: {
      id: 'report-6',
      interviewId: 'interview-6',
      summary: 'OldGuard Inc. churned due to budget cuts and a shift in company strategy. The decision was not related to product performance, which they rated highly. They may be a candidate for re-engagement in a future fiscal year.',
      keyTakeaways: [{ id: 'kt-6-1', text: 'Churn was due to external factors, not product dissatisfaction.', category: 'Opportunity' }],
      quotes: [{ id: 'q-6-1', text: "We loved the product, but our new CFO cut all non-essential software budgets.", attribution: 'Robert Paulson' }],
      competitorsMentioned: [],
      productFeedback: [],
      tags: [{ id: 'tag-churn', name: 'Churn', color: 'red' }],
    },
  },
  {
    id: 'interview-churn-2',
    title: 'Churn Analysis - TechForward',
    participantName: 'Lisa Ray',
    participantRole: 'Head of Product',
    company: 'TechForward',
    date: '2024-08-15T10:00:00.000Z',
    status: 'Completed',
    outcome: 'Churn',
    programId: 'prog-2',
    reportType: 'Human',
    report: {
      id: 'report-churn-2',
      interviewId: 'interview-churn-2',
      summary: 'TechForward churned after being acquired by a larger company that uses Competitor Z exclusively. The team was very happy with our product but was forced to switch for corporate standardization.',
      keyTakeaways: [{ id: 'kt-c2-1', text: 'Churn was due to acquisition, not product fit.', category: 'Threat' }],
      quotes: [{ id: 'q-c2-1', text: "We fought to keep you, but the new parent company has a global deal with Competitor Z.", attribution: 'Lisa Ray' }],
      competitorsMentioned: [{ id: 'comp-z', name: 'Competitor Z' }],
      productFeedback: [],
      tags: [{ id: 'tag-churn', name: 'Churn', color: 'red' }, { id: 'tag-ma', name: 'M&A', color: 'purple' }],
    },
  },
  {
    id: 'interview-renew-1',
    title: 'Renewal Discussion - Global Solutions',
    participantName: 'David Chen',
    participantRole: 'Director of Ops',
    company: 'Global Solutions',
    date: '2024-09-01T11:00:00.000Z',
    status: 'Completed',
    outcome: 'Renew',
    programId: 'prog-1',
    reportType: 'Human',
    report: {
      id: 'report-renew-1',
      interviewId: 'interview-renew-1',
      summary: 'Global Solutions renewed for a multi-year contract, citing the platform\'s reliability and the new reporting features as key drivers. They see us as a long-term partner.',
      keyTakeaways: [{ id: 'kt-r1-1', text: 'Product reliability and new features drove a multi-year renewal.', category: 'Strength' }],
      quotes: [{ id: 'q-r1-1', text: "Your platform is rock-solid, and the new aggregate reports save my team hours every week. It was an easy decision to renew.", attribution: 'David Chen' }],
      competitorsMentioned: [],
      productFeedback: [{ id: 'pf-r1-1', feature: 'Aggregate Reporting', sentiment: 'Positive', comment: 'The new aggregate reporting is a game-changer for us.' }],
      tags: [{ id: 'tag-renew', name: 'Renew', color: 'blue' }, { id: 'tag-enterprise', name: 'Enterprise', color: 'purple' }],
    },
  },
  {
    id: 'survey-1',
    title: 'NPS Survey Feedback Q3',
    participantName: 'Survey Response',
    participantRole: 'Various',
    company: 'Multiple',
    date: '2024-09-15T00:00:00.000Z',
    status: 'Completed',
    outcome: 'No Decision',
    programId: 'prog-3',
    reportType: 'Survey',
    report: {
      id: 'report-survey-1',
      interviewId: 'survey-1',
      summary: 'Aggregated feedback from the Q3 NPS survey. Overall sentiment is positive, with users praising the new analytics features. Common detractors mentioned the mobile app\'s performance.',
      keyTakeaways: [{ id: 'kt-s1-1', text: 'Analytics features are well-received.', category: 'Strength' }, { id: 'kt-s1-2', text: 'Mobile app performance is a recurring issue.', category: 'Weakness' }],
      quotes: [{ id: 'q-s1-1', text: "The new themes page is fantastic for our quarterly reviews.", attribution: 'Anonymous User' }],
      competitorsMentioned: [],
      productFeedback: [],
      tags: [{ id: 'tag-survey', name: 'Survey', color: 'yellow' }],
    },
  },
  {
    id: 'survey-2',
    title: 'Onboarding Experience Survey',
    participantName: 'Survey Response',
    participantRole: 'New Users',
    company: 'Multiple',
    date: '2024-10-01T00:00:00.000Z',
    status: 'Completed',
    outcome: 'No Decision',
    programId: 'prog-1',
    reportType: 'Survey',
    report: {
      id: 'report-survey-2',
      interviewId: 'survey-2',
      summary: 'Feedback from users who completed onboarding in the last 30 days. The process is generally seen as smooth, but some users requested more in-app guidance for advanced features.',
      keyTakeaways: [{ id: 'kt-s2-1', text: 'Onboarding is smooth for basic setup.', category: 'Strength' }, { id: 'kt-s2-2', text: 'Users want more guidance on advanced features.', category: 'Opportunity' }],
      quotes: [],
      competitorsMentioned: [],
      productFeedback: [],
      tags: [{ id: 'tag-survey', name: 'Survey', color: 'yellow' }, { id: 'tag-onboarding', name: 'Onboarding', color: 'blue' }],
    },
  },
];
const NEW_MOCK_INTERVIEWS: Interview[] = [];
const outcomes: InterviewOutcome[] = ['Won', 'Lost', 'Churn', 'Renew', 'No Decision'];
const statuses: InterviewStatus[] = ['Completed', 'Scheduled', 'In Progress', 'Canceled'];
const programIds = ['prog-1', 'prog-2', 'prog-3'];
const competitors = ['Microsoft Teams', 'Google Meet', 'Webex', 'Slack'];
const companies = ['Stripe', 'Shopify', 'Coinbase', 'Figma', 'Notion', 'Airtable', 'Datadog', 'Snowflake', 'Palantir', 'Twilio', 'Scale AI', 'Brex'];
const roles = ['CEO', 'CTO', 'VP of Engineering', 'Product Manager', 'Marketing Manager', 'Sales Director', 'IT Administrator'];
const names = ['Alex Johnson', 'Maria Garcia', 'Chen Wei', 'Fatima Al-Sayed', 'David Smith', 'Yuki Tanaka', 'Olga Ivanova', 'Carlos Rodriguez', 'Nia Williams', 'Ben Carter'];
const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date): Date => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
for (let i = 7; i <= 56; i++) {
  const interviewId = `interview-${i}`;
  const company = getRandomElement(companies);
  const outcome = getRandomElement(outcomes);
  let status: InterviewStatus = 'Completed';
  if (outcome === 'No Decision') {
    status = getRandomElement(['Scheduled', 'In Progress']);
  } else if (Math.random() < 0.05) { // 5% chance of being canceled
    status = 'Canceled';
  }
  const competitor = getRandomElement(competitors);
  const date = getRandomDate(new Date('2024-04-01'), new Date('2025-10-01')).toISOString();
  const participantName = getRandomElement(names);
  const interview: Interview = {
    id: interviewId,
    title: `${outcome} analysis with ${company}`,
    participantName,
    participantRole: getRandomElement(roles),
    company: company,
    date: date,
    status: status,
    outcome: outcome,
    programId: getRandomElement(programIds),
    reportType: 'Human',
  };
  if (status === 'Completed') {
    interview.report = {
      id: `report-${i}`,
      interviewId: interviewId,
      summary: `This is a summary for the ${outcome.toLowerCase()} interview with ${company}. The key competitor mentioned was ${competitor}. The discussion revolved around feature parity and pricing.`,
      keyTakeaways: [
        { id: `kt-${i}-1`, text: `Feature set was a key factor.`, category: (outcome === 'Won' || outcome === 'Renew') ? 'Strength' : 'Weakness' },
        { id: `kt-${i}-2`, text: `Pricing compared to ${competitor} was discussed.`, category: 'Threat' },
      ],
      quotes: [
        { id: `q-${i}-1`, text: `The integration with ${competitor} was a major point of discussion.`, attribution: participantName },
      ],
      competitorsMentioned: [
        { id: `comp-${competitor.toLowerCase().replace(' ', '-')}`, name: competitor },
      ],
      productFeedback: [
        { id: `pf-${i}-1`, feature: 'Video Quality', sentiment: 'Positive', comment: 'Video quality was consistently high.' },
      ],
      tags: [
        { id: `tag-${outcome.toLowerCase()}`, name: outcome, color: (outcome === 'Won' || outcome === 'Renew') ? 'blue' : 'red' },
        { id: 'tag-smb', name: 'SMB', color: 'blue' },
      ],
    };
  }
  NEW_MOCK_INTERVIEWS.push(interview);
}
const BLIND_SPOT_INTERVIEWS: Interview[] = [
    {
        id: 'bs-1',
        title: '', participantName: '', participantRole: '', company: '',
        date: '2024-07-20T10:00:00.000Z',
        status: 'Completed',
        outcome: 'Won',
        programId: 'prog-1',
        isBlindSpot: true,
        anonymizedTitle: 'Enterprise SaaS Win vs. Google Meet',
        anonymizedParticipant: 'SVP at a Fortune 500 Tech Company',
        report: undefined,
        reportType: 'Blind Spot',
    },
    {
        id: 'bs-2',
        title: '', participantName: '', participantRole: '', company: '',
        date: '2024-07-18T14:00:00.000Z',
        status: 'Completed',
        outcome: 'Lost',
        programId: 'prog-3',
        isBlindSpot: true,
        anonymizedTitle: 'Mid-Market Communications Platform Loss',
        anonymizedParticipant: 'Director of IT at a Healthcare Provider',
        report: undefined,
        reportType: 'Blind Spot',
    },
    {
        id: 'bs-3',
        title: '', participantName: '', participantRole: '', company: '',
        date: '2024-06-25T11:00:00.000Z',
        status: 'Completed',
        outcome: 'Won',
        programId: 'prog-1',
        isBlindSpot: true,
        anonymizedTitle: 'Fintech Startup Win Against Microsoft Teams',
        anonymizedParticipant: 'CTO at a Series B Fintech Company',
        report: undefined,
        reportType: 'Blind Spot',
    },
    {
        id: 'bs-4',
        title: '', participantName: '', participantRole: '', company: '',
        date: '2024-06-15T09:30:00.000Z',
        status: 'Completed',
        outcome: 'Lost',
        programId: 'prog-2',
        isBlindSpot: true,
        anonymizedTitle: 'E-commerce Platform Churn to Slack',
        anonymizedParticipant: 'Head of Operations at a Retail Company',
        report: undefined,
        reportType: 'Blind Spot',
    },
    {
        id: 'bs-5',
        title: '', participantName: '', participantRole: '', company: '',
        date: '2024-05-30T16:00:00.000Z',
        status: 'Completed',
        outcome: 'Won',
        programId: 'prog-3',
        isBlindSpot: true,
        anonymizedTitle: 'SMB Agency Win',
        anonymizedParticipant: 'Owner of a Digital Marketing Agency',
        report: undefined,
        reportType: 'Blind Spot',
    }
];
const MOCK_INTERVIEWS: Interview[] = [...MOCK_INTERVIEWS_BASE, ...NEW_MOCK_INTERVIEWS, ...BLIND_SPOT_INTERVIEWS];
export class InterviewEntity extends IndexedEntity<Interview> {
  static readonly entityName = "interview";
  static readonly indexName = "interviews";
  static readonly initialState: Interview = {
    id: "",
    title: "",
    participantName: "",
    participantRole: "",
    company: "",
    date: new Date().toISOString(),
    status: 'Scheduled',
  };
  static seedData = MOCK_INTERVIEWS;
}
const MOCK_PROMPTS: Prompt[] = [
    {
        id: 'prompt-1',
        name: 'Executive Summary',
        description: 'Generates a high-level summary of key win/loss reasons for an executive audience.',
        promptText: 'Based on the following interview transcripts, generate a one-paragraph executive summary highlighting the key reasons for the win or loss. Focus on business impact and strategic implications. Be concise and direct.'
    },
    {
        id: 'prompt-2',
        name: 'Competitor Insights',
        description: 'Extracts all mentions of competitors and their perceived strengths and weaknesses.',
        promptText: 'From the provided interview transcripts, identify all mentions of competitors. For each competitor, list their name, perceived strengths, and perceived weaknesses as described by the interviewee. Format as a bulleted list.'
    },
    {
        id: 'prompt-3',
        name: 'Product Feedback Analysis',
        description: 'Summarizes positive and negative product feedback.',
        promptText: 'Analyze the following interview transcripts for product-specific feedback. Create two lists: "Positive Feedback" and "Areas for Improvement". For each item, note the feature mentioned and a brief summary of the feedback.'
    },
    {
        id: 'prompt-4',
        name: 'Summarize Win Reasons',
        description: 'Creates a summary of common themes from all "Won" interviews.',
        promptText: 'Analyze the following transcripts from WON deals. Identify the top 3-5 recurring themes or reasons for winning. For each theme, provide a brief explanation and include 1-2 supporting quotes. Format as a markdown document.'
    },
    {
        id: 'prompt-5',
        name: 'Summarize Loss Reasons',
        description: 'Creates a summary of common themes from all "Lost" interviews.',
        promptText: 'Analyze the following transcripts from LOST deals. Identify the top 3-5 recurring themes or reasons for losing. For each theme, provide a brief explanation and include 1-2 supporting quotes. Focus on actionable insights. Format as a markdown document.'
    },
    {
        id: 'prompt-6',
        name: 'Quarterly Slides',
        description: 'Generates key metrics and takeaways formatted for a quarterly business review slide deck.',
        promptText: 'Create a summary of the provided interviews suitable for a quarterly business review. Include the following sections: "Key Metrics (Win Rate, Top Competitors)", "Top 3 Win Themes with Quotes", "Top 3 Loss Themes with Quotes", and "Emerging Trends". Be concise and use bullet points.'
    },
    {
        id: 'prompt-7',
        name: 'Extract Juicy Quotes',
        description: 'Finds the most impactful and quotable customer statements for marketing and sales decks.',
        promptText: 'Scan the following interview transcripts for "juicy quotes". Identify 3-5 of the most compelling, impactful, or emotionally resonant statements made by the customer. For each quote, provide the full text and the attribution. Prioritize quotes that clearly articulate value, pain points, or competitive differentiation.'
    }
];
export class PromptEntity extends IndexedEntity<Prompt> {
    static readonly entityName = "prompt";
    static readonly indexName = "prompts";
    static readonly initialState: Prompt = {
        id: "",
        name: "",
        description: "",
        promptText: ""
    };
    static seedData = MOCK_PROMPTS;
}
export class AggregateReportEntity extends IndexedEntity<AggregateReport> {
    static readonly entityName = "aggregateReport";
    static readonly indexName = "aggregateReports";
    static readonly initialState: AggregateReport = {
        id: "",
        title: "",
        generatedSummary: "",
        sourceInterviewIds: [],
        promptId: "",
        dateGenerated: "",
        reportType: 'AI',
    };
}
export class ProgramEntity extends IndexedEntity<Program> {
    static readonly entityName = "program";
    static readonly indexName = "programs";
    static readonly initialState: Program = {
        id: "",
        name: "",
    };
    static seedData = MOCK_PROGRAMS;
}
const MOCK_USERS: User[] = [
    { id: 'user-1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', avatarUrl: 'https://i.pravatar.cc/40?u=user-1' },
    { id: 'user-2', name: 'Bob Williams', email: 'bob@example.com', role: 'Editor', avatarUrl: 'https://i.pravatar.cc/40?u=user-2' },
    { id: 'user-3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Viewer', avatarUrl: 'https://i.pravatar.cc/40?u=user-3' },
    { id: 'user-4', name: 'Diana Miller', email: 'diana@example.com', role: 'Editor', avatarUrl: 'https://i.pravatar.cc/40?u=user-4' },
];
export class UserEntity extends IndexedEntity<User> {
    static readonly entityName = "user";
    static readonly indexName = "users";
    static readonly initialState: User = {
        id: "",
        name: "",
        email: "",
        role: 'Viewer',
    };
    static seedData = MOCK_USERS;
}