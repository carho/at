import { Service, inject, Signal } from '@angular/core';
import {  HttpErrorResponse } from '@angular/common/http';
import { httpResource } from '@angular/common/http';
import { API_CONFIG } from '../app.config';
import { MerriamWebsterEntry, MerriamWebsterThesaurusEntry } from './interfaces';

@Service()
export class MerriamWebsterService {
  private config = inject(API_CONFIG);

  /**
   * Lexikon-Suche
   */
  getDefinitions(wordSignal: Signal<string>) {
    // KORREKTUR: Nur 1 generischer Parameter erlaubt
    return httpResource<MerriamWebsterEntry[]>(
      () => {
        const word = wordSignal();
        if (!word || word.trim() === '') return undefined;

        const { baseUrl, apiKey } = this.config.dictionary;
        return `${baseUrl}/${encodeURIComponent(word.trim())}?key=${apiKey}`;
      },
      {
        // KORREKTUR: 'parse' statt 'map'. 'raw' muss explizit als 'unknown' typisiert werden
        parse: (raw: unknown) => {
          // Falls die API fehlerhafte HTTP-Metadaten mitsendet, fangen wir sie hier ab
          if (raw instanceof HttpErrorResponse) {
            throw new Error(this.mapErrorMessage(raw));
          }
          return raw as MerriamWebsterEntry[];
        },
      },
    );
  }

  /**
   * Thesaurus-Suche
   */
  getSynonyms(wordSignal: Signal<string>) {
    return httpResource<MerriamWebsterThesaurusEntry[]>(
      () => {
        const word = wordSignal();
        if (!word || word.trim() === '') return undefined;

        const { baseUrl, apiKey } = this.config.thesaurus;
        return `${baseUrl}/${encodeURIComponent(word.trim())}?key=${apiKey}`;
      },
      {
        parse: (raw: unknown) => {
          if (raw instanceof HttpErrorResponse) {
            throw new Error(this.mapErrorMessage(raw));
          }
          return raw as MerriamWebsterThesaurusEntry[];
        },
      },
    );
  }

  /**
   * Zentrale, objektorientierte Fehlerübersetzung innerhalb der Datenschicht
   */
  private mapErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 0:
        return 'Keine Internetverbindung oder die Merriam-Webster API ist offline.';
      case 401:
        return 'Ungültiger API-Schlüssel. Bitte überprüfe deine Konfiguration (app.config.ts).';
      case 403:
        return 'API-Limit erreicht! Das tägliche Abfragekontingent für diesen API-Key ist erschöpft.';
      case 404:
        return 'Der angeforderte API-Endpunkt wurde nicht gefunden.';
      default:
        return `Unerwarteter Fehler (${error.status}): ${error.message || 'Bitte versuchen Sie es später erneut.'}`;
    }
  }
}
