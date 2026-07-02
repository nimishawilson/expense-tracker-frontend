import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<h1>Dashboard</h1>`,
})
export class DashboardComponent {}
