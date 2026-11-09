import { Component, Output, EventEmitter, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiErrorComponent } from '../api-error/api-error.component'; // ApiErrorComponent bleibt, da im HTML genutzt

@Component({
  selector: 'app-search-layout',
  standalone: true,
  imports: [CommonModule, ApiErrorComponent], // Ungenutzte FormFields entfernt
  templateUrl: './search-layout.component.html',
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      /* Garantiert, dass der gestrichelte Rahmen der Startbox sichtbar ist */
      .border-dashed {
        border: 2px dashed #dee2e6 !important;
        background-color: #f8f9fa !important;
        border-radius: 0.375rem;
      }

      /* ::ng-deep sorgt dafür, dass die Stile auch für die hineingereichten (projizierten) Cards greifen */
      ::ng-deep {
        .card {
          background-color: #ffffff !important;
          border: 9px solid #dee2e6 !important;
          border-radius: 0.375rem;
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
        }

        .list-group-item {
          border-bottom: 1px solid #eee !important;
        }

        .list-group-item:last-child {
          border-bottom: none !important;
        }
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

  protected hasInputValue = computed(() => {
    const formInstance = this.searchFormGroup();
    if (!formInstance || !formInstance.value) return false;

    // FIX: Prüfen, ob es sich um ein Signal handelt, sonst direkt auslesen
    const valueField = formInstance.value;
    const currentQuery = typeof valueField === 'function' ? valueField() : valueField;

    return !!(currentQuery && currentQuery.trim().length > 0);
  });
}
