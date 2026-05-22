import { Injectable, computed, signal } from '@angular/core';
import { EXPENSE_CATEGORIES } from '../pages/expenses/expense.constants';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly _custom = signal<string[]>([]);

  readonly defaultCategories: readonly string[] = EXPENSE_CATEGORIES;
  readonly customCategories = this._custom.asReadonly();
  readonly allCategories = computed(() => [...this.defaultCategories, ...this._custom()]);

  isDefault(name: string): boolean {
    return (this.defaultCategories as readonly string[]).includes(name);
  }

  add(name: string): void {
    this._custom.update((list) => [...list, name]);
  }

  rename(oldName: string, newName: string): void {
    this._custom.update((list) => list.map((n) => (n === oldName ? newName : n)));
  }

  delete(name: string): void {
    this._custom.update((list) => list.filter((n) => n !== name));
  }
}
