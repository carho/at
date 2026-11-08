import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { form, debounce, FormField } from '@angular/forms/signals';
import { MerriamWebsterService } from '../../services/merriam-webster.service';
import { FormFieldComponent } from '../../directives/form-field.component';

@Component({
  selector: 'app-thesaurus-search',
  standalone: true,
  imports: [CommonModule, FormFieldComponent, FormField],
  templateUrl: './thesaurus-search.component.html',
  styleUrls: ['../dictionary-search/dictionary-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThesaurusSearchComponent {
  private dictionaryService = inject(MerriamWebsterService);
  protected readonly Array = Array;

  protected searchHistory = signal<string[]>([]);
  protected searchModel = signal({ query: '' });

  protected searchForm = form(this.searchModel, (path) => {
    debounce(path.query, 2000);
  });

  protected searchSignal = computed(() => this.searchForm.query().value());
  protected thesaurusResource = this.dictionaryService.getSynonyms(this.searchSignal);

  constructor() {
    effect(() => {
      const word = this.searchSignal()?.trim();
      if (word && word.length > 1) {
        this.searchHistory.update((history) => {
          const filtered = history.filter((w) => w.toLowerCase() !== word.toLowerCase());
          return [word, ...filtered].slice(0, 5);
        });
      }
    });
  }

  // NEU: Hilfsfunktion zur eindeutigen Typtrennung im HTML-Template
  protected isStringArray(value: unknown[]): value is string[] {
    return typeof value[0] === 'string';
  }

  protected selectWord(word: string) {
    this.searchForm.query().value.set(word);
  }

  protected selectSuggestion(word: unknown) {
    if (typeof word === 'string') {
      this.selectWord(word);
    }
  }

  protected clearHistory() {
    this.searchHistory.set([]);
  }
}
