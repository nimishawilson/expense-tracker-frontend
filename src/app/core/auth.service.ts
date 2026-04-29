import { Injectable, signal } from '@angular/core';

export interface CurrentUser {
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // TODO: populate from JWT / session on login
  readonly currentUser = signal<CurrentUser>({ name: 'Jane Doe', email: 'jane@example.com' });
}
