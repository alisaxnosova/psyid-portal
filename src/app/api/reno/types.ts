export interface RenoSession {
  id: string;
  codeId: string;
  userType: 'third_party' | 'portal' | 'youth';
  source: 'etsy' | 'fiverr' | 'direct';
  status: 'started' | 'intake_done' | 'in_progress' | 'completed';
  device?: 'mobile' | 'desktop' | 'unknown';
  isRetake?: boolean;
  /** Sequential research participant ID, e.g. "P-00001" (portal) / "E-00001" (external).
   *  Assigned once, on completion, only to consenting subjects who gave demographics. */
  participantId?: string;
  intake?: {
    consent: boolean;
    age?: number;
    sex?: string;
    country?: string;
    nativeLanguage?: string;
    education?: string;
    occupation?: string;
    employmentStatus?: string;
    relationshipStatus?: string;
  };
  answers: {
    questionId: string;
    answerId: string;
    answeredAt: string;
    responseTimeMs?: number;
  }[];
  lastIndex: number;
  createdAt: string;
  completedAt?: string;
}

export interface RenoSessionsMap {
  [codeId: string]: string;
}
