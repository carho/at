import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormField } from '@angular/forms/signals';
import { MerriamWebsterService } from '../../services/merriam-webster.service';
import { FormFieldComponent } from '../../directives/form-field.component';
import { BaseSearchDirective } from '../base-search.directive';
import { ApiErrorComponent } from '../api-error/api-error.component';

@Component({
  selector: 'app-dictionary-search',
  standalone: true,
  imports: [CommonModule, FormFieldComponent, FormField, ApiErrorComponent],
  templateUrl: './dictionary-search.component.html',
  styleUrls: ['./dictionary-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DictionarySearchComponent extends BaseSearchDirective {
  private dictionaryService = inject(MerriamWebsterService);

  // Die spezifische Resource für das Lexikon
  protected dictionaryResource = this.dictionaryService.getDefinitions(this.searchSignal);

  // Implementierung der abstrakten Methode für die Basisklasse
  override getResourceError(): unknown {
    return this.dictionaryResource.error();
  }

  // HIER DIESE METHODE ERGÄNZEN:
  protected isStringArray(value: unknown[]): value is string[] {
    return typeof value[0] === 'string';
  }
}
