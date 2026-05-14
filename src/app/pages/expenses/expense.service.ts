import { Injectable, signal } from '@angular/core';
import type { Expense } from './expense.model';

const MOCK_EXPENSES: Expense[] = [
  {
    id: '1',
    amount: 120.0,
    description: 'Team lunch',
    category: 'Food & Drinks',
    date: new Date('2026-05-10'),
    paidBy: 'Jane Doe',
    splitEnabled: true,
    splitType: 'equal',
    participants: ['Jane Doe', 'Alice', 'Bob'],
    shares: [
      { name: 'Jane Doe', amount: 40.0 },
      { name: 'Alice', amount: 40.0 },
      { name: 'Bob', amount: 40.0 },
    ],
  },
  {
    id: '2',
    amount: 24.5,
    description: 'Uber to office',
    category: 'Transportation',
    date: new Date('2026-05-09'),
    paidBy: 'Jane Doe',
    splitEnabled: false,
    participants: [],
  },
  {
    id: '3',
    amount: 85.0,
    description: 'Grocery run',
    category: 'Food & Drinks',
    date: new Date('2026-05-08'),
    paidBy: 'Alice',
    splitEnabled: true,
    splitType: 'equal',
    participants: ['Jane Doe', 'Alice'],
    shares: [
      { name: 'Jane Doe', amount: 42.5 },
      { name: 'Alice', amount: 42.5 },
    ],
  },
  {
    id: '4',
    amount: 1200.0,
    description: 'Monthly rent',
    category: 'Housing',
    date: new Date('2026-05-01'),
    paidBy: 'Jane Doe',
    splitEnabled: true,
    splitType: 'equal',
    participants: ['Jane Doe', 'Bob'],
    shares: [
      { name: 'Jane Doe', amount: 600.0 },
      { name: 'Bob', amount: 600.0 },
    ],
  },
  {
    id: '5',
    amount: 15.99,
    description: 'Netflix subscription',
    category: 'Entertainment',
    date: new Date('2026-05-03'),
    paidBy: 'Jane Doe',
    splitEnabled: false,
    participants: [],
  },
  {
    id: '6',
    amount: 340.0,
    description: 'Flight tickets',
    category: 'Travel',
    date: new Date('2026-05-12'),
    paidBy: 'Bob',
    splitEnabled: true,
    splitType: 'equal',
    participants: ['Jane Doe', 'Alice', 'Bob'],
    shares: [
      { name: 'Jane Doe', amount: 113.33 },
      { name: 'Alice', amount: 113.33 },
      { name: 'Bob', amount: 113.34 },
    ],
  },
  {
    id: '7',
    amount: 55.0,
    description: 'Electricity bill',
    category: 'Bills & Utilities',
    date: new Date('2026-04-28'),
    paidBy: 'Jane Doe',
    splitEnabled: true,
    splitType: 'equal',
    participants: ['Jane Doe', 'Bob'],
    shares: [
      { name: 'Jane Doe', amount: 27.5 },
      { name: 'Bob', amount: 27.5 },
    ],
  },
  {
    id: '8',
    amount: 200.0,
    description: 'Supermarket',
    category: 'Shopping',
    date: new Date('2026-04-20'),
    paidBy: 'Alice',
    splitEnabled: true,
    splitType: 'percentage',
    participants: ['Jane Doe', 'Alice'],
    shares: [
      { name: 'Jane Doe', amount: 80.0 },
      { name: 'Alice', amount: 120.0 },
    ],
  },
  {
    id: '9',
    amount: 45.0,
    description: 'Doctor visit',
    category: 'Healthcare',
    date: new Date('2026-04-15'),
    paidBy: 'Jane Doe',
    splitEnabled: false,
    participants: [],
  },
];

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly _expenses = signal<Expense[]>(MOCK_EXPENSES);

  readonly expenses = this._expenses.asReadonly();

  getById(id: string): Expense | undefined {
    return this._expenses().find((e) => e.id === id);
  }

  delete(id: string): void {
    this._expenses.update((list) => list.filter((e) => e.id !== id));
  }

  update(updated: Expense): void {
    this._expenses.update((list) => list.map((e) => (e.id === updated.id ? updated : e)));
  }
}