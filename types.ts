
export enum CampaignStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  DRAFT = 'DRAFT'
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  BUDGET = 'BUDGET',
  COUPONS = 'COUPONS',
  ANALYSIS = 'ANALYSIS'
}

export interface BudgetAllocation {
  channel: string;
  amount: number;
  percentage: number;
  expectedROI: number;
}

export interface CouponStrategy {
  type: string;
  value: string;
  targetSegment: string;
  triggerCondition: string;
  efficiency?: number;
  status: 'RUNNING' | 'TESTING' | 'STOPPED';
}

export interface MarketingPlan {
  name: string;
  objective: string;
  totalBudget: number;
  allocations: BudgetAllocation[];
  strategies: CouponStrategy[];
  reasoning: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  plan?: MarketingPlan;
}
