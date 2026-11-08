import { Directive, signal, computed, effect } from '@angular/core';
import { form, debounce } from '@angular/forms/signals';

@Directive()
export abstract class BaseSearchDirective {
  readonly Array = Array;

  searchHistory = signal<string[]>([]);
  searchModel = signal({ query: '' });

  searchForm = form(this.searchModel, (path) => {
    debounce(path.query, 2000);
  });

  searchSignal = computed(() => this.searchForm.query().value());

  // Abstrakte Schnittstelle zu den jeweiligen Komponenten-Resources
  abstract getResourceError(): unknown;

  // Zentraler UI-Titel basierend auf der Fehlermeldung
  errorTitle = computed(() => {
    const msg = this.errorMessage();
    if (!msg) return 'Fehler';

    if (
      msg.indexOf('API-Schlüssel') !== -1 ||
      msg.indexOf('API-Limit') !== -1 ||
      msg.indexOf('Parsing-Fehler') !== -1
    ) {
      return 'Konfigurations-Fehler';
    }
    if (msg.indexOf('Internetverbindung') !== -1) {
      return 'Verbindungs-Problem';
    }
    return 'Unerwarteter Fehler';
  });

  // Zentraler Fehler-Parser für die Angular Resource API
  errorMessage = computed(() => {
    const error = this.getResourceError();
    if (!error) return null;

    const errObj = error as any;

    // 1. Extraktion des HTTP-Statuscodes aus allen denkbaren Kapselungsebenen
    const status =
      errObj?.status !== undefined
        ? errObj.status
        : errObj?.error?.status !== undefined
          ? errObj.error.status
          : errObj?.value?.status !== undefined
            ? errObj.value.status
            : errObj?.cause?.status !== undefined
              ? errObj.cause.status
              : undefined;

    const rawMessage = errObj?.message || errObj?.error?.message || errObj?.cause?.message || '';

    // 2. Abfangen von HTTP-Parsing-Fehlern (z.B. reiner Text "Invalid API key" statt JSON)
    if (rawMessage.indexOf('parsing') !== -1 || rawMessage.indexOf('Unexpected token') !== -1) {
      return 'API-Antwort fehlerhaft (Parsing-Fehler). Bitte überprüfe die Gültigkeit deines API-Schlüssels.';
    }

    if (status !== undefined) {
      if (status === 0) {
        return 'Keine Internetverbindung oder die Merriam-Webster API ist offline.';
      }

      switch (status) {
        case 401:
          return 'Ungültiger API-Schlüssel. Bitte überprüfe deine Konfiguration (app.config.ts).';
        case 403:
          return 'API-Limit erreicht! Das tägliche Abfragekontingent für diesen API-Key ist erschöpft.';
        case 404:
          return 'Der angeforderte API-Endpunkt wurde nicht gefunden.';
        default:
          return `Schnittstellen-Fehler (${status}): ${rawMessage || 'Bitte versuchen Sie es später erneut.'}`;
      }
    }

    // 3. Fallback für rohe Textfehler
    if (errObj?.message && errObj.message.indexOf('[object Object]') === -1) {
      return errObj.message;
    }
    return 'Ein unbekannter Systemfehler ist aufgetreten.';
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

  protected selectWord(word: string) {
    this.searchForm.query().value.set(word);
  }

  protected selectSuggestion(word: unknown) {
    if (typeof word === 'string') this.selectWord(word);
  }

  protected clearHistory() {
    this.searchHistory.set([]);
  }
}
