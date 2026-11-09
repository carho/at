import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // FIX: Ermöglicht stabiles, reaktives Signal-Binding
import { MerriamWebsterService } from '../../services/merriam-webster.service';
import { BaseSearchDirective } from '../base-search.directive';
import { ApiErrorComponent } from '../api-error/api-error.component';

@Component({
  selector: 'app-dictionary-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // Hier drin!
    ApiErrorComponent,
  ],
  templateUrl: './dictionary-search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DictionarySearchComponent extends BaseSearchDirective {
  private dictionaryService = inject(MerriamWebsterService);
  protected dictionaryResource = this.dictionaryService.getDefinitions(this.searchSignal);

  override getResourceError(): unknown {
    return this.dictionaryResource.error();
  }
  override isLoading(): boolean {
    return this.dictionaryResource.isLoading();
  }
  override hasData(): boolean {
    return this.dictionaryResource.hasValue();
  }
  override retrySearch(): void {
    this.dictionaryResource.reload();
  }
}
