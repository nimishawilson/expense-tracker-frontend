import type { SplitPreviewRow, SplitType } from './expense.model';

interface SplitPreviewInput {
  splitType: SplitType;
  total: number;
  participants: { name: string; value: number }[];
}

export function calculateSplitPreview({ splitType, total, participants }: SplitPreviewInput): SplitPreviewRow[] {
  if (participants.length === 0) return [];

  switch (splitType) {
    case 'equal':
      return participants.map(({ name }) => ({
        name,
        share: +(total / participants.length).toFixed(2),
      }));

    case 'percentage':
      return participants.map(({ name, value }) => ({
        name,
        share: +((value / 100) * total).toFixed(2),
      }));

    case 'exact':
      return participants.map(({ name, value }) => ({ name, share: value }));

    case 'shares': {
      const totalShares = participants.reduce((s, p) => s + (p.value || 0), 0);
      return participants.map(({ name, value }) => ({
        name,
        share: totalShares > 0 ? +((value / totalShares) * total).toFixed(2) : 0,
      }));
    }
  }
}