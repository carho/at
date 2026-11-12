import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WikipediaService } from '../../services/wikipedia.service';
import { BaseSearchDirective } from '../base-search.directive';
import { SearchLayoutComponent } from '../search-layout/search-layout.component';

@Component({
  selector: 'app-wikipedia-search',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchLayoutComponent],
  templateUrl: './wikipedia-search.component.html',
  styles: [':host { display: block; width: 100%; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WikipediaSearchComponent extends BaseSearchDirective {
  private wikipediaService = inject(WikipediaService);

  // Nutzt das entprellte searchSignal der Basis-Direktive
  protected wikiResource = this.wikipediaService.getWikiArticles(this.searchSignal);

  override getResourceError(): unknown {
    return this.wikiResource.error();
  }

  override isLoading(): boolean {
    return this.wikiResource.isLoading();
  }

  override hasData(): boolean {
    return this.wikiResource.hasValue() && !this.wikiResource.error();
  }

  override retrySearch(): void {
    this.wikiResource.reload();
  }
}
