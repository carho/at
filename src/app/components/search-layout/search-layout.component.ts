import { Component, Output, EventEmitter, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormField } from '@angular/forms/signals';
import { FormFieldComponent } from '../../directives/form-field.component';
import { ApiErrorComponent } from '../api-error/api-error.component';

@Component({
  selector: 'app-search-layout',
  standalone: true,
  imports: [CommonModule, FormFieldComponent, FormField, ApiErrorComponent],
  templateUrl: './search-layout.component.html',
  styles: [
    `
      .border-dashed {
        border: 2px dashed #ced4da !important;
        background-color: #fafafa;
      }
    `,
  ],
})
export class SearchLayoutComponent {
  searchFormGroup = input.required<any>();
  history = input<string[]>([]);
  isLoading = input<boolean>(false);
  hasData = input<boolean>(false);
  errorTitle = input<string>('Fehler');
  errorMessage = input<string | null>(null);

  @Output() selectWord = new EventEmitter<string>();
  @Output() clearHistory = new EventEmitter<void>();
  @Output() retry = new EventEmitter<void>();

  // FIX: Prüft über das value()-Signal, ob Text im Eingabefeld steht
  protected hasInputValue = computed(() => {
    const formInstance = this.searchFormGroup();
    if (!formInstance || !formInstance.value) return false;

    const currentQuery = formInstance.value().query;
    return !!(currentQuery && currentQuery.trim().length > 0);
  });
}
