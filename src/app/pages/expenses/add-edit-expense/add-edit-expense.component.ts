import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
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

const CATEGORIES = [
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

const SPLIT_TYPES = [
  { value: 'equal', label: 'Equal' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'exact', label: 'Exact Amount' },
  { value: 'shares', label: 'Shares' },
] as const;

function atLeastOneParticipantValidator(control: AbstractControl): ValidationErrors | null {
  const arr = control as FormArray;
  return arr.length === 0 ? { atLeastOne: true } : null;
}

function percentageSumValidator(control: AbstractControl): ValidationErrors | null {
  const arr = control as FormArray;
  if (arr.length === 0) return null;
  const sum = arr.controls.reduce((acc, c) => acc + (+c.get('value')!.value || 0), 0);
  return Math.abs(sum - 100) > 0.01 ? { percentageSum: true } : null;
}

function makeExactAmountSumValidator(getAmount: () => number) {
  return (control: AbstractControl): ValidationErrors | null => {
    const arr = control as FormArray;
    if (arr.length === 0) return null;
    const sum = arr.controls.reduce((acc, c) => acc + (+c.get('value')!.value || 0), 0);
    const total = getAmount();
    return Math.abs(sum - total) > 0.01 ? { exactSum: true } : null;
  };
}

interface SplitPreviewRow {
  name: string;
  share: number;
}

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

  readonly categories = CATEGORIES;
  readonly splitTypes = SPLIT_TYPES;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  isEditMode = signal(false);
  isSubmitting = signal(false);
  submitError = signal('');

  pageTitle = computed(() => (this.isEditMode() ? 'Edit Expense' : 'Add Expense'));
  submitLabel = computed(() => {
    if (this.isSubmitting()) return 'Saving...';
    return this.isEditMode() ? 'Save Changes' : 'Add Expense';
  });

  // Updated on form.valueChanges so computed signals react to form changes
  private _formValue = signal<unknown>(null);

  paidByOptions = computed<string[]>(() => {
    this._formValue();
    const names = this.participants.controls
      .map((c) => c.get('name')!.value as string)
      .filter(Boolean);
    return ['Me', ...names];
  });

  splitPreview = computed<SplitPreviewRow[]>(() => {
    this._formValue();
    return this.calculateSplitPreview();
  });

  form: FormGroup;

  get participants(): FormArray {
    return this.form.get('participants') as FormArray;
  }

  get splitEnabled(): boolean {
    return !!this.form.get('splitEnabled')!.value;
  }

  get splitType(): string {
    return this.form.get('splitType')!.value as string;
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
    this.form.valueChanges.subscribe((v) => this._formValue.set(v));

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.loadExpenseForEdit(id);
    }

    this.form.get('splitEnabled')!.valueChanges.subscribe(() => this.updateSplitValidators());
    this.form.get('splitType')!.valueChanges.subscribe(() => this.updateSplitValidators());
    this.form.get('amount')!.valueChanges.subscribe(() => this.updateSplitValidators());
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
    const removedName = this.participants.at(index).get('name')!.value as string;
    this.participants.removeAt(index);
    if (this.form.get('paidBy')!.value === removedName) {
      this.form.get('paidBy')!.setValue('Me');
    }
    this.updateSplitValidators();
  }

  onChipAdd(event: MatChipInputEvent): void {
    const name = (event.value || '').trim();
    if (name) {
      this.addParticipant(name);
    }
    event.chipInput!.clear();
  }

  updateSplitValidators(): void {
    const validators = [];

    if (this.splitEnabled) {
      validators.push(atLeastOneParticipantValidator);
      if (this.splitType === 'percentage') {
        validators.push(percentageSumValidator);
      } else if (this.splitType === 'exact') {
        validators.push(makeExactAmountSumValidator(() => this.amount));
      }
    }

    this.participants.setValidators(validators.length ? validators : null);
    this.participants.updateValueAndValidity({ emitEvent: false });

    this.participants.controls.forEach((ctrl) => {
      const valueCtrl = ctrl.get('value')!;
      if (!this.splitEnabled || this.splitType === 'equal') {
        valueCtrl.clearValidators();
      } else if (this.splitType === 'shares') {
        valueCtrl.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.pattern(/^\d+$/),
        ]);
      } else {
        valueCtrl.setValidators([Validators.required, Validators.min(0.01)]);
      }
      valueCtrl.updateValueAndValidity({ emitEvent: false });
    });
  }

  private calculateSplitPreview(): SplitPreviewRow[] {
    if (!this.splitEnabled || this.participants.length === 0) return [];
    const total = this.amount;
    const count = this.participants.length;
    const controls = this.participants.controls;

    switch (this.splitType) {
      case 'equal':
        return controls.map((c) => ({
          name: c.get('name')!.value,
          share: +(total / count).toFixed(2),
        }));
      case 'percentage':
        return controls.map((c) => ({
          name: c.get('name')!.value,
          share: +((+c.get('value')!.value / 100) * total).toFixed(2),
        }));
      case 'exact':
        return controls.map((c) => ({
          name: c.get('name')!.value,
          share: +c.get('value')!.value,
        }));
      case 'shares': {
        const totalShares = controls.reduce((s, c) => s + (+c.get('value')!.value || 0), 0);
        return controls.map((c) => ({
          name: c.get('name')!.value,
          share:
            totalShares > 0
              ? +((+c.get('value')!.value / totalShares) * total).toFixed(2)
              : 0,
        }));
      }
      default:
        return [];
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.participants.controls.forEach((c) => (c as FormGroup).markAllAsTouched());
      return;
    }
    this.isSubmitting.set(true);
    this.submitError.set('');
    // TODO: call ExpenseService.create / update — send intent, not pre-calculated shares
    const payload = {
      amount: this.form.value.amount,
      description: this.form.value.description,
      category: this.form.value.category,
      date: this.form.value.date,
      paidBy: this.form.value.paidBy,
      splitEnabled: this.form.value.splitEnabled,
      splitType: this.form.value.splitType,
      participants: this.form.value.participants,
    };
    console.log('Expense payload:', payload);
    this.isSubmitting.set(false);
    this.router.navigate(['/expenses']);
  }

  onCancel(): void {
    this.router.navigate(['/expenses']);
  }
}
