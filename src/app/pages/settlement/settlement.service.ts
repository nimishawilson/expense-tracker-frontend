import { Injectable, signal } from '@angular/core';
import type { Settlement } from './settlement.model';

export const KNOWN_PARTICIPANTS = ['Jane Doe', 'Alice', 'Bob'];

const MOCK_SETTLEMENTS: Settlement[] = [
  {
    id: '1',
    fromUser: 'Bob',
    toUser: 'Jane Doe',
    amount: 600.0,
    note: 'Rent share for May',
    date: new Date('2026-05-05'),
  },
  {
    id: '2',
    fromUser: 'Alice',
    toUser: 'Jane Doe',
    amount: 42.5,
    note: 'Grocery split',
    date: new Date('2026-05-09'),
  },
  {
    id: '3',
    fromUser: 'Jane Doe',
    toUser: 'Bob',
    amount: 113.33,
    note: 'Flight ticket share',
    date: new Date('2026-05-14'),
  },
  {
    id: '4',
    fromUser: 'Alice',
    toUser: 'Bob',
    amount: 113.33,
    note: 'Flight ticket share',
    date: new Date('2026-05-14'),
  },
];

@Injectable({ providedIn: 'root' })
export class SettlementService {
  private readonly _settlements = signal<Settlement[]>(MOCK_SETTLEMENTS);
  readonly settlements = this._settlements.asReadonly();

  add(payload: Omit<Settlement, 'id'>): void {
    const id = Date.now().toString();
    this._settlements.update((list) => [{ id, ...payload }, ...list]);
  }
}
