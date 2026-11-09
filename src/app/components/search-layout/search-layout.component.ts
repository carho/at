import { Component, Output, EventEmitter, input, computed, TemplateRef } from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { FormField } from '@angular/forms/signals';
import { FormFieldComponent } from '../../directives/form-field.component';
import { ApiErrorComponent } from '../api-error/api-error.component';

@Component({
  selector: 'app-search-layout',
  standalone: true,
  imports: [CommonModule, NgTemplateOutlet, FormFieldComponent, FormField, ApiErrorComponent],
  templateUrl: './search-layout.component.html',
  styleUrls: ['../dictionary-search/dictionary-search.component.scss'],
  styles: [
    `
      .min-vh-50 {
        min-height: 50vh;
      }
      .border-dashed {
        border: 2px dashed #ced4da !important;
        background-color: #fafafa;
      }
    `,
  ],
})
export class SearchLayoutComponent {
  // Deklaration aller benötigten State-Inputs mittels v22 Signals
  searchFormGroup = input.required<any>();
  history = input<string[]>([]);
  isLoading = input<boolean>(false);
  errorTitle = input<string>('Fehler');
  errorMessage = input<string | null>(null);
  hasValue = input<boolean>(false);

  // Sichere Bereitstellung des ausgelagerten Ergebnis-Templates
  contentTemplate = input.required<TemplateRef<any>>();

  // Berechnetes Signal zur direkten Steuerung des Initial-Zustands
  protected searchInputValue = computed(() => {
    const val = this.searchFormGroup().query().value();
    return val && val.trim().length > 0;
  });

  // Event-Schnittstellen für die Kommunikation mit der Basis-Direktive
  @Output() selectWord = new EventEmitter<string>();
  @Output() clearHistory = new EventEmitter<void>();
  @Output() retry = new EventEmitter<void>();
}
