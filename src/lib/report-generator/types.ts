import type { RenoScore } from '@/lib/renoScore';

export interface ReportInput {
  sessionId: string;
  score: RenoScore;
  code?: string;
  intake?: {
    firstName?: string;
    age?: number;
    country?: string;
    occupation?: string;
    employmentStatus?: string;
  };
  completedAt?: string;
}

export interface GeneratedSections {
  intro: string;
  typeOverview: string;
  energyAxis: string;
  perceptionAxis: string;
  decisionAxis: string;
  organizationAxis: string;
  superpowers: string;
  blindSpots: string;
  misreads: string;
  careers: string;
  goodEnvironments: string;
  badEnvironments: string;
  moneyRisk: string;
  relationships: string;
  actionPlan: string;
  closing: string;
}
