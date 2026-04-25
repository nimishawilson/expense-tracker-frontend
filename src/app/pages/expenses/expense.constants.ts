import type { SplitTypeOption } from './expense.model';

export const EXPENSE_CATEGORIES = [
  'Food & Drinks',
  'Transportation',
  'Housing',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Education',
  'Travel',
  'Bills & Utilities',
  'Other',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const SPLIT_TYPE_OPTIONS: SplitTypeOption[] = [
  { value: 'equal', label: 'Equal' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'exact', label: 'Exact Amount' },
  { value: 'shares', label: 'Shares' },
];