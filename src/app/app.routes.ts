import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'expenses',
    loadComponent: () =>
      import('./pages/expenses/expense-list/expense-list.component').then(
        (m) => m.ExpenseListComponent,
      ),
  },
  {
    path: 'expenses/new',
    loadComponent: () =>
      import('./pages/expenses/add-edit-expense/add-edit-expense.component').then(
        (m) => m.AddEditExpenseComponent,
      ),
  },
  {
    path: 'expenses/:id',
    loadComponent: () =>
      import('./pages/expenses/expense-detail/expense-detail.component').then(
        (m) => m.ExpenseDetailComponent,
      ),
  },
  {
    path: 'expenses/:id/edit',
    loadComponent: () =>
      import('./pages/expenses/add-edit-expense/add-edit-expense.component').then(
        (m) => m.AddEditExpenseComponent,
      ),
  },
  {
    path: 'balances',
    loadComponent: () =>
      import('./pages/balance/balance.component').then((m) => m.BalanceComponent),
  },
  {
    path: 'settlements',
    loadComponent: () =>
      import('./pages/settlement/settlement.component').then((m) => m.SettlementComponent),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
  },
];
