import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormField, MatLabel, MatError, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatButton, MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';

import { SettlementService, KNOWN_PARTICIPANTS } from './settlement.service';
import { AuthService } from '../../core/auth.service';
import type { Settlement } from './settlement.model';

@Component({
  selector: 'app-settlement',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatPrefix,
    MatInput,
    MatSelect,
    MatOption,
    MatButton,
    MatFabButton,
    MatIcon,
    MatDivider,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
  ],
  templateUrl: './settlement.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './settlement.component.scss',
})
export class SettlementComponent {
  private settlementService = inject(SettlementService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  readonly settlements = this.settlementService.settlements;
  readonly hasSettlements = computed(() => this.settlements().length > 0);
  readonly currentUserName = computed(() => this.authService.currentUser().name);
  readonly knownParticipants = KNOWN_PARTICIPANTS;

  readonly showForm = signal(false);

  readonly form = this.fb.group({
    fromUser: [this.authService.currentUser().name, Validators.required],
    toUser: ['', Validators.required],
    amount: ['', [Validators.required, Validators.min(0.01)]],
    note: [''],
  });

  openForm(): void {
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.form.reset({ fromUser: this.currentUserName() });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    if (v.fromUser === v.toUser) {
      this.form.get('toUser')!.setErrors({ sameUser: true });
      return;
    }
    this.settlementService.add({
      fromUser: v.fromUser!,
      toUser: v.toUser!,
      amount: +v.amount!,
      note: v.note || undefined,
      date: new Date(),
    });
    this.closeForm();
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  isOutgoing(s: Settlement): boolean {
    return s.fromUser === this.currentUserName();
  }

  isIncoming(s: Settlement): boolean {
    return s.toUser === this.currentUserName();
  }

  getDirectionLabel(s: Settlement): string {
    if (this.isOutgoing(s)) return 'You paid';
    if (this.isIncoming(s)) return 'You received';
    return '';
  }
}
