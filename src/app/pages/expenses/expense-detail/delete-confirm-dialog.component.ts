import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [MatButton, MatDialogTitle, MatDialogContent, MatDialogActions],
  template: `
    <h2 mat-dialog-title>Delete Expense</h2>
    <mat-dialog-content>
      <p>Delete <strong>"{{ data.description }}"</strong>? This cannot be undone.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="close(false)">Cancel</button>
      <button mat-flat-button class="confirm-delete-btn" (click)="close(true)">Delete</button>
    </mat-dialog-actions>
  `,
  styles: [
    `.confirm-delete-btn {
      background-color: var(--mat-sys-error);
      color: var(--mat-sys-on-error);
    }`,
  ],
})
export class DeleteConfirmDialogComponent {
  readonly data = inject<{ description: string }>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<DeleteConfirmDialogComponent>);

  close(result: boolean): void {
    this.dialogRef.close(result);
  }
}