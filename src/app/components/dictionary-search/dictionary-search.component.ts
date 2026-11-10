import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MerriamWebsterService } from '../../services/merriam-webster.service';
import { BaseSearchDirective } from '../base-search.directive';
import { SearchLayoutComponent } from '../search-layout/search-layout.component'; // HIER IMPORTIEREN

@Component({
  selector: 'app-dictionary-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchLayoutComponent, // HIER HINZUFÜGEN
  ],
  templateUrl: './dictionary-search.component.html',
  styles: [':host { display: block; width: 100%; }'], // HIER EINFÜGEN

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
    return this.dictionaryResource.hasValue() && !this.dictionaryResource.error();
  }
  override retrySearch(): void {
    this.dictionaryResource.reload();
  }
}
