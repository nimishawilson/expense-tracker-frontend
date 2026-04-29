export type SplitType = 'equal' | 'percentage' | 'exact' | 'shares';

export interface SplitTypeOption {
  value: SplitType;
  label: string;
}

export interface SplitPreviewRow {
  name: string;
  share: number;
}

export interface ParticipantValue {
  name: string;
  value: number;
}

export interface ExpensePayload {
  amount: number;
  description: string;
  category: string;
  date: Date;
  paidBy: string;
  splitEnabled: boolean;
  splitType: SplitType;
  participants: ParticipantValue[];
}