import { Component, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent } from '@angular/material/card';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { passwordsMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
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
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  form: FormGroup;
  hidePassword = signal(true);
  hideConfirm = signal(true);
  serverError = signal('');

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.form = this.fb.group(
      {
        name: [
          '',
          [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z ]+$/)],
        ],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordsMatch },
    );
  }

  togglePassword() {
    this.hidePassword.update((v) => !v);
  }

  toggleConfirm() {
    this.hideConfirm.update((v) => !v);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // TODO: call auth service
    this.router.navigate(['/login']);
  }
}