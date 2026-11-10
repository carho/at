import { Directive, signal, computed, effect, debounced } from '@angular/core'; // HIER KORRIGIERT

@Directive()
export abstract class BaseSearchDirective {
  readonly Array = Array;

  // Das pure Eingabe-Signal
  searchQuery = signal<string>('');
  searchHistory = signal<string[]>([]);

  // Völlig speichersicherer, nativer Angular v22 Debounce direkt aus @angular/core
  // debounced() nimmt das Quell-Signal und die Zeitspanne in ms entgegen
  private debouncedResource = debounced(this.searchQuery, 2000);

  // Da debounced() ein Signal-Äquivalent mit .value() liefert, mappen wir es hier
  // für die Abwärtskompatibilität deiner Resource-Aufrufe
  searchSignal = computed(() => this.debouncedResource.value() || '');

  abstract getResourceError(): unknown;
  abstract isLoading(): boolean;
  abstract hasData(): boolean;
  abstract retrySearch(): void;

  errorMessage = computed(() => {
    const error = this.getResourceError();
    if (!error) return null;
    return (error as any)?.message || 'Ein Fehler ist aufgetreten.';
  });

  constructor() {
    effect(() => {
      const word = this.searchSignal()?.trim();
      if (word && word.length > 1 && !this.getResourceError()) {
        this.searchHistory.update((history) => {
          const filtered = history.filter((w) => w.toLowerCase() !== word.toLowerCase());
          return [word, ...filtered].slice(0, 5);
        });
      }
    });
  }

  selectWord(word: string) {
    this.searchQuery.set(word);
  }

  clearHistory() {
    this.searchHistory.set([]);
  }
}
