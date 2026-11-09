import { Directive, signal, computed, effect } from '@angular/core';

@Directive()
export abstract class BaseSearchDirective {
  readonly Array = Array;

  // Das pure, unkomplizierte Suchsignal
  searchQuery = signal<string>('');
  searchHistory = signal<string[]>([]);

  // Simuliert den Debounce: Reagiert erst, wenn der Text stabil ist
  private debouncedQuery = signal<string>('');
  private timeoutId: any;

  // Dieses Signal füttert direkt die API-Resource
  searchSignal = computed(() => {
    const text = this.searchQuery();
    // Setzt den Debounce-Timeout (z.B. 500ms für besseres Suchgefühl als 2s)
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.debouncedQuery.set(text);
    }, 500);
    return this.debouncedQuery();
  });

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
