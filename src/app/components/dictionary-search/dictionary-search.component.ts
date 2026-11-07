import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MerriamWebsterService } from '../../services/merriam-webster.service'; // Pfad prüfen!

@Component({
  selector: 'app-dictionary-search',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dictionary-search.component.html', // Verweis auf die externe HTML-Datei
})
export class DictionarySearchComponent {
  private dictionaryService = inject(MerriamWebsterService);

  protected rawSearchQuery = signal<string>('');
  protected debouncedSearchQuery = signal<string>('');
  protected dictionaryResource = this.dictionaryService.getDefinitions(this.debouncedSearchQuery);

  private timeoutId: any;

  onInputChange(value: string) {
    this.rawSearchQuery.set(value);

    if (this.timeoutId) clearTimeout(this.timeoutId);

    this.timeoutId = setTimeout(() => {
      this.debouncedSearchQuery.set(value);
    }, 250);
  }

  // Hilfsmethode für das Template, um API-Vorschläge (Strings) zu identifizieren
  protected isString(val: any): boolean {
    return typeof val === 'string';
  }

  // Ermöglicht es dem Nutzer, auf einen Suchvorschlag zu klicken
  protected selectSuggestion(word: any) {
    if (typeof word === 'string') {
      this.rawSearchQuery.set(word);
      this.debouncedSearchQuery.set(word);
    }
  }
}
