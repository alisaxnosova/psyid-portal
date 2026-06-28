export interface RenoSession {
  id: string;
  codeId: string;
  status: 'started' | 'intake_done' | 'in_progress' | 'completed';
  intake?: {
    consent: boolean;
    parentName: string;
    childName: string;
    childAge: number;
    childGender: string;
    email: string;
  };
  answers: { questionId: string; answerId: string; answeredAt: string }[];
  lastIndex: number;
  createdAt: string;
  completedAt?: string;
}

export interface RenoSessionsMap {
  [codeId: string]: string;
}
