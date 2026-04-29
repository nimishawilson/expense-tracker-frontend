import { AbstractControl, FormArray, ValidationErrors } from '@angular/forms';

export function atLeastOneParticipantValidator(control: AbstractControl): ValidationErrors | null {
  return (control as FormArray).length === 0 ? { atLeastOne: true } : null;
}

export function percentageSumValidator(control: AbstractControl): ValidationErrors | null {
  const arr = control as FormArray;
  if (arr.length === 0) return null;
  const sum = arr.controls.reduce((acc, c) => acc + (+c.get('value')!.value || 0), 0);
  return Math.abs(sum - 100) > 0.01 ? { percentageSum: true } : null;
}

export function makeExactAmountSumValidator(getAmount: () => number) {
  return (control: AbstractControl): ValidationErrors | null => {
    const arr = control as FormArray;
    if (arr.length === 0) return null;
    const sum = arr.controls.reduce((acc, c) => acc + (+c.get('value')!.value || 0), 0);
    return Math.abs(sum - getAmount()) > 0.01 ? { exactSum: true } : null;
  };
}