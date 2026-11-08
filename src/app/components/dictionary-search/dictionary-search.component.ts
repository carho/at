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
  selector: 'app-dictionary-search',
  standalone: true,
  imports: [CommonModule, FormFieldComponent, FormField],
  templateUrl: './dictionary-search.component.html',
  styleUrls: ['./dictionary-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DictionarySearchComponent {
  private dictionaryService = inject(MerriamWebsterService);
  protected readonly Array = Array;

  protected searchHistory = signal<string[]>([]);
  protected searchModel = signal({ query: '' });

  protected searchForm = form(this.searchModel, (path) => {
    debounce(path.query, 2000);
  });

  protected searchSignal = computed(() => this.searchForm.query().value());
  protected dictionaryResource = this.dictionaryService.getDefinitions(this.searchSignal);

  constructor() {
    effect(() => {
      const word = this.searchSignal()?.trim();
      // Fügt das Wort nur der Historie hinzu, wenn kein Fehler vorliegt
      if (word && word.length > 1 && !this.dictionaryResource.error()) {
        this.searchHistory.update((history) => {
          const filtered = history.filter((w) => w.toLowerCase() !== word.toLowerCase());
          return [word, ...filtered].slice(0, 5);
        });
      }
    });
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
