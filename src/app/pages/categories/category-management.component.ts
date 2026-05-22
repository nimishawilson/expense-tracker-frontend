import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { CategoryService } from '../../core/category.service';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [
    FormsModule,
    MatFormField,
    MatLabel,
    MatHint,
    MatInput,
    MatButton,
    MatIconButton,
    MatIcon,
    MatDivider,
  ],
  templateUrl: './category-management.component.html',
  styleUrl: './category-management.component.scss',
})
export class CategoryManagementComponent {
  private categoryService = inject(CategoryService);

  readonly customCategories = this.categoryService.customCategories;
  readonly defaultCategories = this.categoryService.defaultCategories;

  newName = '';
  addError = '';
  editingCategory: string | null = null;
  editValue = '';
  editError = '';

  addCategory(): void {
    const name = this.newName.trim();
    if (!name) return;
    const exists = this.categoryService
      .allCategories()
      .some((c) => c.toLowerCase() === name.toLowerCase());
    if (exists) {
      this.addError = 'Category already exists.';
      return;
    }
    this.categoryService.add(name);
    this.newName = '';
    this.addError = '';
  }

  startEdit(cat: string): void {
    this.editingCategory = cat;
    this.editValue = cat;
    this.editError = '';
  }

  saveEdit(oldName: string): void {
    const newName = this.editValue.trim();
    if (!newName || newName === oldName) {
      this.cancelEdit();
      return;
    }
    const existsElsewhere = this.categoryService
      .allCategories()
      .filter((c) => c !== oldName)
      .some((c) => c.toLowerCase() === newName.toLowerCase());
    if (existsElsewhere) {
      this.editError = 'Category already exists.';
      return;
    }
    this.categoryService.rename(oldName, newName);
    this.cancelEdit();
  }

  cancelEdit(): void {
    this.editingCategory = null;
    this.editValue = '';
    this.editError = '';
  }

  deleteCategory(name: string): void {
    this.categoryService.delete(name);
  }
}
