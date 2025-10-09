export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type InterviewStatus = 'Completed' | 'Scheduled' | 'In Progress' | 'Canceled';
export type InterviewOutcome = 'Won' | 'Lost' | 'Churn' | 'Renew' | 'No Decision';
export type ReportType = 'Human' | 'AI' | 'Blind Spot' | 'Survey';
export interface Program {
  id: string;
  name: string;
}
export interface Tag {
  id: string;
  name: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
}
export interface Competitor {
  id: string;
  name: string;
  logoUrl?: string;
}
export interface KeyTakeaway {
  id: string;
  text: string;
  category: 'Strength' | 'Weakness' | 'Opportunity' | 'Threat';
}
export interface Quote {
  id:string;
  text: string;
  attribution: string;
}
export interface DashboardQuote {
  id: string;
  text: string;
  interviewId: string;
  interviewTitle: string;
  participantInfo: string;
}
export interface ProductFeedback {
  id: string;
  feature: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  comment: string;
}
export interface InterviewReport {
  id: string;
  interviewId: string;
  summary: string;
  keyTakeaways: KeyTakeaway[];
  quotes: Quote[];
  competitorsMentioned: Competitor[];
  productFeedback: ProductFeedback[];
  tags: Tag[];
}
export interface Interview {
  id: string;
  title: string;
  participantName: string;
  participantRole: string;
  company: string;
  date: string; // ISO 8601 date string
  status: InterviewStatus;
  outcome?: InterviewOutcome;
  programId?: string;
  report?: InterviewReport;
  isBlindSpot?: boolean;
  anonymizedTitle?: string;
  anonymizedParticipant?: string;
  reportType?: ReportType;
}
export interface BuyerDecisionDriver {
  driver: string;
  impact: number;
}
export interface DashboardStats {
  totalInterviews: number;
  completedInterviews: number;
  winRate: number;
  chartData: { name: string; wins: number; losses: number }[];
  keyCompetitor: { name: string; mentionCount: number };
  buyerDecisionDrivers?: BuyerDecisionDriver[];
}
export interface Prompt {
  id: string;
  name: string;
  description: string;
  promptText: string;
}
export interface AggregateReport {
    id: string;
    title: string;
    generatedSummary: string;
    sourceInterviewIds: string[];
    promptId: string;
    dateGenerated: string; // ISO 8601 date string
    reportType: ReportType;
}
export type UserRole = 'Admin' | 'Editor' | 'Viewer';
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}
export interface ThemeReason {
  reason: string;
  count: number;
}
export interface ThemeCategory {
  categoryName: string;
  winReasons: ThemeReason[];
  lossReasons: ThemeReason[];
}
export interface CompetitorMention {
  name: string;
  count: number;
  [key: string]: string | number;
}
export interface ProductFeedbackSentiment {
  feature: string;
  positive: number;
  negative: number;
  neutral: number;
}
export interface AnalyticsData {
  themes: ThemeCategory[];
  competitorMentions: CompetitorMention[];
  productFeedbackSentiment: ProductFeedbackSentiment[];
}
export interface ModalConfig {
  isOpen: boolean;
  initialPromptId?: string;
  initialOutcomeFilter?: InterviewOutcome[];
}