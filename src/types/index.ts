// Standalone type definitions — no @prisma/client import to avoid build-time DB dependency
// Must stay in sync with prisma/schema.prisma

export type Role = "ADMIN" | "MANAGER" | "REP" | "VIEWER";
export type DealStatus = "OPEN" | "WON" | "LOST";
export type ActivityType =
  | "STAGE_CHANGE"
  | "VALUE_CHANGE"
  | "NOTE_ADDED"
  | "CREATED"
  | "AI_RISK_ASSESSED";

// User & Org Types
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  organizationId: string;
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
}

// Pipeline Stage with Deal aggregations
export interface PipelineStageWithDeals {
  id: string;
  name: string;
  orderIndex: number;
  defaultProbability: number;
  colorToken: string;
  organizationId: string;
  deals: DealCardData[];
  totalValue?: number;
  weightedValue?: number;
}

// Lightweight Deal data for Kanban cards and table rows
export interface DealCardData {
  id: string;
  title: string;
  value: number;
  probability: number;
  stageId: string;
  accountId: string;
  contactId?: string | null;
  ownerId: string;
  expectedCloseDate: string; // ISO string
  status: DealStatus;
  createdAt: string;
  updatedAt: string;
  account: {
    id: string;
    name: string;
    industry?: string | null;
  };
  contact?: {
    id: string;
    fullName: string;
    email?: string | null;
    title?: string | null;
  } | null;
  owner: {
    id: string;
    fullName: string;
    email: string;
  };
  riskAnalysis?: {
    riskScore: number;
    riskLevel: string;
    stallDays: number;
    summary: string;
    recommendation: string;
  } | null;
}

// Detailed Deal with Notes and Activities
export interface DealDetailData extends DealCardData {
  activities: {
    id: string;
    actionType: ActivityType;
    oldValue?: string | null;
    newValue?: string | null;
    createdAt: string;
    actor: {
      id: string;
      fullName: string;
    };
  }[];
  notes: {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    author: {
      id: string;
      fullName: string;
    };
  }[];
}

// Filter and Search Params
export interface DealQueryParams {
  query?: string;
  stageId?: string;
  ownerId?: string;
  status?: DealStatus;
  sortBy?: "value" | "expectedCloseDate" | "createdAt" | "title";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Analytics Metrics Payload
export interface PipelineAnalyticsData {
  totalOpenValue: number;
  weightedForecastValue: number;
  averageWinRate: number;
  totalDealsCount: number;
  stageBreakdown: {
    stageId: string;
    stageName: string;
    dealCount: number;
    totalValue: number;
    weightedValue: number;
  }[];
}
