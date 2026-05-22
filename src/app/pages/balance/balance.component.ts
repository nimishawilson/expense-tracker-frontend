import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';

import { BalanceService } from './balance.service';
import type { UserBalance } from './balance.model';

@Component({
  selector: 'app-balance',
  standalone: true,
  imports: [CurrencyPipe, MatIcon, MatButton, MatDivider],
  templateUrl: './balance.component.html',
  styleUrl: './balance.component.scss',
})
export class BalanceComponent {
  private balanceService = inject(BalanceService);
  private router = inject(Router);

  readonly summary = this.balanceService.summary;
  readonly hasBalances = computed(() => this.summary().perUser.length > 0);

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  isOwedToMe(u: UserBalance): boolean {
    return u.amount > 0;
  }

  goToSettlements(): void {
    this.router.navigate(['/settlements']);
  }
}