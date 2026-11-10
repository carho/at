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

    const errObj = error as any;

    // 1. Fall: Keine Internetverbindung / Netzwerkfehler (Status 0)
    if (
      errObj.status === 0 ||
      errObj.message?.includes('status: 0') ||
      errObj.name === 'TimeoutError'
    ) {
      return 'Keine Internetverbindung. Bitte überprüfe dein Netzwerk und versuche es erneut.';
    }

    // 2. Fall: API-Key falsch / Server liefert Text statt JSON (Parsing-Fehler)
    if (errObj.name === 'HttpErrorResponse' && errObj.message?.includes('parsing')) {
      return 'Ungültiger API-Key oder unerwartetes Format der Server-Antwort.';
    }

    // Allgemeiner Fallback
    return errObj?.error?.message || errObj?.message || 'Ein unerwarteter Fehler ist aufgetreten.';
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
