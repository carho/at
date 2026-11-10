import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MerriamWebsterService } from '../../services/merriam-webster.service';
import { BaseSearchDirective } from '../base-search.directive';
import { SearchLayoutComponent } from '../search-layout/search-layout.component'; // HIER IMPORTIEREN

@Component({
  selector: 'app-thesaurus-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchLayoutComponent, // HIER HINZUFÜGEN
  ],
  templateUrl: './thesaurus-search.component.html',
  styles: [':host { display: block; width: 100%; }'], // HIER EINFÜGEN


  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThesaurusSearchComponent extends BaseSearchDirective {
  private dictionaryService = inject(MerriamWebsterService);
  protected thesaurusResource = this.dictionaryService.getSynonyms(this.searchSignal);

  override getResourceError(): unknown {
    return this.thesaurusResource.error();
  }
  override isLoading(): boolean {
    return this.thesaurusResource.isLoading();
  }
  override hasData(): boolean {
    return this.thesaurusResource.hasValue()&& !this.thesaurusResource.error();
  }
  override retrySearch(): void {
    this.thesaurusResource.reload();
  }
}
