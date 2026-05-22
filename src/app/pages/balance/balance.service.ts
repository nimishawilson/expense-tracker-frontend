import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { ExpenseService } from '../expenses/expense.service';
import { SettlementService } from '../settlement/settlement.service';
import type { BalanceSummary } from './balance.model';

@Injectable({ providedIn: 'root' })
export class BalanceService {
  private authService = inject(AuthService);
  private expenseService = inject(ExpenseService);
  private settlementService = inject(SettlementService);

  readonly summary = computed<BalanceSummary>(() => {
    const me = this.authService.currentUser().name;
    const expenses = this.expenseService.expenses();
    const settlements = this.settlementService.settlements();

    // debt[fromUser][toUser] = raw amount fromUser owes toUser
    const debt = new Map<string, Map<string, number>>();

    const addDebt = (from: string, to: string, amount: number) => {
      if (!debt.has(from)) debt.set(from, new Map());
      const inner = debt.get(from)!;
      inner.set(to, (inner.get(to) ?? 0) + amount);
    };

    for (const expense of expenses) {
      if (!expense.splitEnabled || !expense.shares?.length) continue;
      for (const share of expense.shares) {
        if (share.name !== expense.paidBy) {
          addDebt(share.name, expense.paidBy, share.amount);
        }
      }
    }

    // Settlements reduce debt (negative addDebt)
    for (const s of settlements) {
      addDebt(s.fromUser, s.toUser, -s.amount);
    }

    // Collect all users who have any debt relationship with me
    const others = new Set<string>();
    debt.forEach((inner, from) => {
      if (from === me) inner.forEach((_, to) => others.add(to));
      inner.forEach((_, to) => {
        if (to === me) others.add(from);
      });
    });

    const perUser = Array.from(others)
      .map((other) => {
        const otherOwesMe = debt.get(other)?.get(me) ?? 0;
        const iOweOther = debt.get(me)?.get(other) ?? 0;
        return { user: other, amount: otherOwesMe - iOweOther };
      })
      .filter((u) => Math.abs(u.amount) > 0.001)
      .sort((a, b) => b.amount - a.amount); // owed-to-me first

    const youAreOwed = perUser.filter((u) => u.amount > 0).reduce((s, u) => s + u.amount, 0);
    const youOwe = perUser.filter((u) => u.amount < 0).reduce((s, u) => s + Math.abs(u.amount), 0);

    return { youOwe, youAreOwed, net: youAreOwed - youOwe, perUser };
  });
}