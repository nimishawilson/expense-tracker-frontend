import { Component, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { ErrorStateMatcher } from '@angular/material/core';

function newPasswordsMatch(control: AbstractControl): ValidationErrors | null {
  const newPw = control.get('newPassword')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return newPw && confirm && newPw !== confirm ? { passwordsMismatch: true } : null;
}

class ConfirmPasswordErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control?.invalid && control?.touched) ||
      !!(form?.errors?.['passwordsMismatch'] && control?.touched);
  }
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatSuffix,
    MatInput,
    MatButton,
    MatIconButton,
    MatIcon,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;

  currentUser = signal({ name: 'Jane Doe', email: 'jane@example.com' });

  hideCurrentPassword = signal(true);
  hideNewPassword = signal(true);
  hideConfirmPassword = signal(true);

  profileSaving = signal(false);
  profileSuccess = signal('');
  profileError = signal('');

  passwordSaving = signal(false);
  passwordSuccess = signal('');
  passwordError = signal('');

  confirmPasswordMatcher = new ConfirmPasswordErrorMatcher();

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      name: [
        '',
        [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z ]+$/)],
      ],
      email: [{ value: '', disabled: true }],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: newPasswordsMatch },
    );
  }

  ngOnInit(): void {
    this.profileForm.patchValue({
      name: this.currentUser().name,
      email: this.currentUser().email,
    });
  }

  toggleCurrentPassword() {
    this.hideCurrentPassword.update((v) => !v);
  }

  toggleNewPassword() {
    this.hideNewPassword.update((v) => !v);
  }

  toggleConfirmPassword() {
    this.hideConfirmPassword.update((v) => !v);
  }

  onSaveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.profileSaving.set(true);
    this.profileSuccess.set('');
    this.profileError.set('');
    // TODO: call user service to update profile
    this.currentUser.update((u) => ({ ...u, name: this.profileForm.get('name')!.value }));
    this.profileSuccess.set('Profile updated successfully');
    this.profileSaving.set(false);
  }

  onChangePassword(formDir: FormGroupDirective) {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.passwordSaving.set(true);
    this.passwordSuccess.set('');
    this.passwordError.set('');
    // TODO: call auth service to change password
    formDir.resetForm();
    this.passwordSuccess.set('Password changed successfully');
    this.passwordSaving.set(false);
  }
}
