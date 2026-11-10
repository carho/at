import { Component, Output, EventEmitter, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiErrorComponent } from '../api-error/api-error.component';
import { BaseSearchEntry } from '../../models/search.models'; // Pfad anpassen

@Component({
  selector: 'app-search-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, ApiErrorComponent],
  templateUrl: './search-layout.component.html',
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
      .border-dashed {
        border: 2px dashed #dee2e6 !important;
        background-color: #f8f9fa !important;
        border-radius: 0.375rem;
      }
    `,
  ],
})
export class SearchLayoutComponent {
  searchQuery = input.required<string>();
  history = input<string[]>([]); // FIX: Typisiert als Array
  isLoading = input<boolean>(false);
  hasData = input<boolean>(false);
  errorMessage = input<string | null>(null);
  errorTitle = input<string>('Fehler aufgetreten'); // FIX: Sicherer Fallback-String

  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() selectWord = new EventEmitter<string>();
  @Output() clearHistory = new EventEmitter<void>();
  @Output() retry = new EventEmitter<void>();

  get hasInputValue(): boolean {
    return this.searchQuery().trim().length > 0;
  }
}
