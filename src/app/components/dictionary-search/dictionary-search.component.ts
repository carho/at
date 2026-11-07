import { Component, inject, signal, computed } from '@angular/core';
import { form, FormField, debounce } from '@angular/forms/signals';
import { MerriamWebsterService } from '../../services/merriam-webster.service';

@Component({
  selector: 'app-dictionary-search',
  standalone: true,
  imports: [FormField],
  templateUrl: './dictionary-search.component.html',
})
export class DictionarySearchComponent {
  private dictionaryService = inject(MerriamWebsterService);

  // Array für den Template-Scope bereitstellen
  protected readonly Array = Array;

  protected searchModel = signal({
    query: '',
  });

  protected searchForm = form(this.searchModel, (path) => {
    debounce(path.query, 2000);
  });

  // KORREKTUR TS2345: Da dein Service ein echtes 'Signal<string>' erwartet,
  // wandeln wir den Wert des Form-Feldes per computed() in ein reines String-Signal um.
  protected searchSignal = computed(() => this.searchForm.query().value());

  protected dictionaryResource = this.dictionaryService.getDefinitions(this.searchSignal);

  protected selectSuggestion(word: unknown) {
    if (typeof word === 'string') {
      // KORREKTUR TS2339: Erst den Feldknoten aufrufen (), dann das .value-Signal setzen!
      this.searchForm.query().value.set(word);
    }
  }
}
