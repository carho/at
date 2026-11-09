import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // FIX: Ermöglicht stabiles, reaktives Signal-Binding im HTML
import { MerriamWebsterService } from '../../services/merriam-webster.service';
import { BaseSearchDirective } from '../base-search.directive';
import { ApiErrorComponent } from '../api-error/api-error.component';

@Component({
  selector: 'app-thesaurus-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // Zwingend benötigt für [(ngModel)]
    ApiErrorComponent,
  ],
  templateUrl: './thesaurus-search.component.html',
  styleUrls: [
    '../../styles/search-layout.scss', // Zentrales CSS-Layout ohne Kapselungslöcher
    '../dictionary-search/dictionary-search.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThesaurusSearchComponent extends BaseSearchDirective {
  private dictionaryService = inject(MerriamWebsterService);

  // Nutzt das stabile computed-Signal der Basisklasse für die API
  protected thesaurusResource = this.dictionaryService.getSynonyms(this.searchSignal);

  // Implementierung der vereinfachten Zustandswächter
  override getResourceError(): unknown {
    return this.thesaurusResource.error();
  }

  override isLoading(): boolean {
    return this.thesaurusResource.isLoading();
  }

  override hasData(): boolean {
    return this.thesaurusResource.hasValue();
  }

  override retrySearch(): void {
    this.thesaurusResource.reload();
  }
}
