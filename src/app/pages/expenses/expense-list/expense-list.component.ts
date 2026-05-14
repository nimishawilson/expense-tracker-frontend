import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatFabButton } from '@angular/material/button';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { MatDivider } from '@angular/material/divider';

import { EXPENSE_CATEGORIES } from '../expense.constants';
import type { Expense } from '../expense.model';
import { ExpenseService } from '../expense.service';
import { AuthService } from '../../../core/auth.service';

const CATEGORY_ICONS: Record<string, string> = {
  'Food & Drinks': 'restaurant',
  Transportation: 'directions_car',
  Housing: 'home',
  Entertainment: 'theaters',
  Shopping: 'shopping_bag',
  Healthcare: 'medical_services',
  Education: 'school',
  Travel: 'flight',
  'Bills & Utilities': 'receipt_long',
  Other: 'category',
};

export type PeriodFilter = 'week' | 'month' | 'last-month' | 'all';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatIcon,
    MatButton,
    MatFabButton,
    MatSelect,
    MatOption,
    MatFormField,
    MatLabel,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatDivider,
  ],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.scss',
})
export class ExpenseListComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private expenseService = inject(ExpenseService);

  readonly categories = EXPENSE_CATEGORIES;

  readonly selectedCategory = signal<string>('');
  readonly selectedPeriod = signal<PeriodFilter>('month');

  readonly currentUserName = computed(() => this.authService.currentUser().name);

  private readonly allExpenses = this.expenseService.expenses;

  readonly filteredExpenses = computed(() => {
    const cat = this.selectedCategory();
    const period = this.selectedPeriod();
    const now = new Date();

    return this.allExpenses().filter((e) => {
      if (cat && e.category !== cat) return false;

      if (period === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return e.date >= weekAgo;
      }
      if (period === 'month') {
        return e.date.getMonth() === now.getMonth() && e.date.getFullYear() === now.getFullYear();
      }
      if (period === 'last-month') {
        const lmStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lmEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        return e.date >= lmStart && e.date <= lmEnd;
      }
      return true;
    });
  });

  readonly groupedExpenses = computed(() => {
    const groups = new Map<string, Expense[]>();

    for (const e of this.filteredExpenses()) {
      const key = e.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(e);
    }

    return Array.from(groups.entries()).map(([label, items]) => ({
      label,
      total: items.reduce((sum, e) => sum + e.amount, 0),
      expenses: items,
    }));
  });

  readonly totalAmount = computed(() =>
    this.filteredExpenses().reduce((sum, e) => sum + e.amount, 0),
  );

  readonly hasExpenses = computed(() => this.filteredExpenses().length > 0);

  getCategoryIcon(category: string): string {
    return CATEGORY_ICONS[category] ?? 'category';
  }

  isPaidByMe(expense: Expense): boolean {
    return expense.paidBy === this.currentUserName();
  }

  getPaidByLabel(expense: Expense): string {
    return this.isPaidByMe(expense) ? 'You paid' : `${expense.paidBy} paid`;
  }

  onCategoryChange(value: string): void {
    this.selectedCategory.set(value);
  }

  onPeriodChange(value: PeriodFilter): void {
    this.selectedPeriod.set(value);
  }

  goToDetail(id: string): void {
    this.router.navigate(['/expenses', id]);
  }

  goToAdd(): void {
    this.router.navigate(['/expenses/new']);
  }
}
