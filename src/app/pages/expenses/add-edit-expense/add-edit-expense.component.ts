import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatFormField, MatLabel, MatError, MatSuffix, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { MatChipGrid, MatChipRow, MatChipInput, MatChipInputEvent } from '@angular/material/chips';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatDivider } from '@angular/material/divider';

import { EXPENSE_CATEGORIES, SPLIT_TYPE_OPTIONS } from '../expense.constants';
import { calculateSplitPreview } from '../expense-split.utils';
import {
  atLeastOneParticipantValidator,
  makeExactAmountSumValidator,
  percentageSumValidator,
} from '../expense.validators';
import type { ExpensePayload, SplitType } from '../expense.model';

@Component({
  selector: 'app-add-edit-expense',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CurrencyPipe,
    MatFormField,
    MatLabel,
    MatError,
    MatSuffix,
    MatPrefix,
    MatInput,
    MatSelect,
    MatOption,
    MatButton,
    MatIconButton,
    MatIcon,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatSlideToggle,
    MatRadioGroup,
    MatRadioButton,
    MatChipGrid,
    MatChipRow,
    MatChipInput,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDivider,
  ],
  templateUrl: './add-edit-expense.component.html',
  styleUrl: './add-edit-expense.component.scss',
})
export class AddEditExpenseComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly categories = EXPENSE_CATEGORIES;
  readonly splitTypes = SPLIT_TYPE_OPTIONS;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  isEditMode = signal(false);
  isSubmitting = signal(false);
  submitError = signal('');

  pageTitle = computed(() => (this.isEditMode() ? 'Edit Expense' : 'Add Expense'));
  submitLabel = computed(() => {
    if (this.isSubmitting()) return 'Saving...';
    return this.isEditMode() ? 'Save Changes' : 'Add Expense';
  });

  // Bridge signal: updated on form.valueChanges so computed() signals react to form state
  private _formValue = signal<unknown>(null);

  paidByOptions = computed<string[]>(() => {
    this._formValue();
    return ['Me', ...this.participantNames()];
  });

  splitPreview = computed(() => {
    this._formValue();
    if (!this.splitEnabled) return [];
    return calculateSplitPreview({
      splitType: this.splitType,
      total: this.amount,
      participants: this.participants.controls.map((c) => ({
        name: c.get('name')!.value as string,
        value: +c.get('value')!.value || 0,
      })),
    });
  });

  form: FormGroup;

  get participants(): FormArray {
    return this.form.get('participants') as FormArray;
  }

  get splitEnabled(): boolean {
    return !!this.form.get('splitEnabled')!.value;
  }

  get splitType(): SplitType {
    return this.form.get('splitType')!.value as SplitType;
  }

  get amount(): number {
    return +this.form.get('amount')!.value || 0;
  }

  constructor() {
    this.form = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required, Validators.minLength(2)]],
      category: ['', Validators.required],
      date: [new Date(), Validators.required],
      paidBy: ['Me', Validators.required],
      splitEnabled: [false],
      splitType: ['equal'],
      participants: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.registerFormListeners();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.loadExpenseForEdit(id);
    }
  }

  addParticipant(name = ''): void {
    this.participants.push(
      this.fb.group({
        name: [name, Validators.required],
        value: [0, [Validators.required, Validators.min(0)]],
      }),
    );
    this.updateSplitValidators();
  }

  removeParticipant(index: number): void {
    const removed = this.participants.at(index).get('name')!.value as string;
    this.participants.removeAt(index);
    if (this.form.get('paidBy')!.value === removed) {
      this.form.get('paidBy')!.setValue('Me');
    }
    this.updateSplitValidators();
  }

  onChipAdd(event: MatChipInputEvent): void {
    const name = (event.value || '').trim();
    if (name) this.addParticipant(name);
    event.chipInput!.clear();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.participants.controls.forEach((c) => (c as FormGroup).markAllAsTouched());
      return;
    }
    this.isSubmitting.set(true);
    this.submitError.set('');
    const payload = this.buildPayload();
    // TODO: call ExpenseService.create / update — send intent, not pre-calculated shares
    console.log('Expense payload:', payload);
    this.isSubmitting.set(false);
    this.router.navigate(['/expenses']);
  }

  onCancel(): void {
    this.router.navigate(['/expenses']);
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private registerFormListeners(): void {
    this.form.valueChanges.subscribe((v) => this._formValue.set(v));
    this.form.get('splitEnabled')!.valueChanges.subscribe(() => this.updateSplitValidators());
    this.form.get('splitType')!.valueChanges.subscribe(() => this.updateSplitValidators());
    this.form.get('amount')!.valueChanges.subscribe(() => this.updateSplitValidators());
  }

  private updateSplitValidators(): void {
    const arrayValidators = this.splitEnabled
      ? [
          atLeastOneParticipantValidator,
          ...(this.splitType === 'percentage' ? [percentageSumValidator] : []),
          ...(this.splitType === 'exact' ? [makeExactAmountSumValidator(() => this.amount)] : []),
        ]
      : [];

    this.participants.setValidators(arrayValidators.length ? arrayValidators : null);
    this.participants.updateValueAndValidity({ emitEvent: false });

    this.participants.controls.forEach((ctrl) => {
      const valueCtrl = ctrl.get('value')!;
      if (!this.splitEnabled || this.splitType === 'equal') {
        valueCtrl.clearValidators();
      } else if (this.splitType === 'shares') {
        valueCtrl.setValidators([Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]);
      } else {
        valueCtrl.setValidators([Validators.required, Validators.min(0.01)]);
      }
      valueCtrl.updateValueAndValidity({ emitEvent: false });
    });
  }

  private buildPayload(): ExpensePayload {
    const v = this.form.value;
    return {
      amount: v.amount,
      description: v.description,
      category: v.category,
      date: v.date,
      paidBy: v.paidBy,
      splitEnabled: v.splitEnabled,
      splitType: v.splitType,
      participants: v.participants,
    };
  }

  private participantNames(): string[] {
    return this.participants.controls
      .map((c) => c.get('name')!.value as string)
      .filter(Boolean);
  }

  private loadExpenseForEdit(_id: string): void {
    // TODO: replace with real ExpenseService.getById(id) call
    this.form.patchValue({
      amount: 120,
      description: 'Team lunch',
      category: 'Food & Drinks',
      date: new Date(),
      paidBy: 'Me',
      splitEnabled: true,
      splitType: 'equal',
    });
    this.addParticipant('Alice');
    this.addParticipant('Bob');
  }
}