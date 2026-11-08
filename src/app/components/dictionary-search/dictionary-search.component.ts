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

  protected dictionaryResource = this.dictionaryService.getDefinitions(this.searchSignal);

  override getResourceError(): unknown {
    return this.dictionaryResource.error();
  }

  protected isStringArray(value: unknown[]): value is string[] {
    return value.length > 0 && typeof value[0] === 'string';
  }
}
