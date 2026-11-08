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

  // Array für Typprüfungen im HTML-Template bereitstellen
  protected readonly Array = Array;

  // Signal für die Historie der letzten 5 Suchbegriffe
  protected searchHistory = signal<string[]>([]);

  protected searchModel = signal({
    query: '',
  });

  protected searchForm = form(this.searchModel, (path) => {
    // Optimierter Debounce auf 500ms für eine flüssige Suche
    debounce(path.query, 2000);
  });

  // Wandelt den Feldwert in ein sauberes String-Signal für den Service um
  protected searchSignal = computed(() => this.searchForm.query().value());

  // Bindung an die httpResource des Services
  protected dictionaryResource = this.dictionaryService.getDefinitions(this.searchSignal);

  constructor() {
    // Effekt überwacht searchSignal und fügt Eingaben automatisch der Historie hinzu
    effect(() => {
      const word = this.searchSignal()?.trim();

      if (word && word.length > 1) {
        this.searchHistory.update((history) => {
          // Duplikate entfernen
          const filtered = history.filter((w) => w.toLowerCase() !== word.toLowerCase());
          // Vorne anfügen und auf 5 Einträge limitieren
          return [word, ...filtered].slice(0, 5);
        });
      }
    });
  }

  // Setzt das Suchfeld auf ein Wort aus der Historie oder den API-Vorschlägen
  protected selectWord(word: string) {
    this.searchForm.query().value.set(word);
  }

  // Setzt das Suchfeld auf einen unbestimmten Vorschlag (Typ-Absicherung)
  protected selectSuggestion(word: unknown) {
    if (typeof word === 'string') {
      this.selectWord(word);
    }
  }

  // Verlauf leeren
  protected clearHistory() {
    this.searchHistory.set([]);
  }
}
