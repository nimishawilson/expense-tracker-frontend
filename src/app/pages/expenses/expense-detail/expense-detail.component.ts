import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';

import { ExpenseService } from '../expense.service';
import { AuthService } from '../../../core/auth.service';
import type { Expense } from '../expense.model';
import { DeleteConfirmDialogComponent } from './delete-confirm-dialog.component';

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

const SPLIT_TYPE_LABELS: Record<string, string> = {
  equal: 'Equal split',
  percentage: 'Percentage split',
  exact: 'Exact amounts',
  shares: 'By shares',
};

@Component({
  selector: 'app-expense-detail',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, MatIcon, MatButton, MatIconButton, MatDivider],
  templateUrl: './expense-detail.component.html',
  styleUrl: './expense-detail.component.scss',
})
export class ExpenseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private expenseService = inject(ExpenseService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  readonly expense = signal<Expense | null>(null);
  readonly isDeleting = signal(false);

  readonly currentUserName = computed(() => this.authService.currentUser().name);

  readonly isPaidByMe = computed(() => {
    const e = this.expense();
    return !!e && e.paidBy === this.currentUserName();
  });

  readonly paidByLabel = computed(() => {
    const e = this.expense();
    if (!e) return '';
    return e.paidBy === this.currentUserName() ? `${e.paidBy} (You)` : e.paidBy;
  });

  readonly splitTypeLabel = computed(() => {
    const e = this.expense();
    return e?.splitType ? (SPLIT_TYPE_LABELS[e.splitType] ?? e.splitType) : '';
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/expenses']);
      return;
    }
    const found = this.expenseService.getById(id);
    if (!found) {
      this.router.navigate(['/expenses']);
      return;
    }
    this.expense.set(found);
  }

  getCategoryIcon(category: string): string {
    return CATEGORY_ICONS[category] ?? 'category';
  }

  goBack(): void {
    this.router.navigate(['/expenses']);
  }

  goToEdit(): void {
    const id = this.expense()?.id;
    if (id) this.router.navigate(['/expenses', id, 'edit']);
  }

  onDeleteClick(): void {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '320px',
      data: { description: this.expense()?.description },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      const id = this.expense()?.id;
      if (id) {
        this.isDeleting.set(true);
        this.expenseService.delete(id);
        this.router.navigate(['/expenses']);
      }
    });
  }
}