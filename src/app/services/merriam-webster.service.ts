import { Service, inject, Signal } from '@angular/core';
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
    return httpResource<MerriamWebsterEntry[]>(
      () => {
        const word = wordSignal();
        if (!word || word.trim() === '') return undefined;

        const { baseUrl, apiKey } = this.config.dictionary;

        // Fix: Rückgabe als valides HttpResourceRequest-Objekt
        return {
          url: `${baseUrl}/${encodeURIComponent(word.trim())}`,
          method: 'GET',
          params: { key: apiKey },
        };
      },
      {
        // Fix: 'parse' statt 'map' für die Transformation/Validierung nutzen
        parse: (response: any) => {
          if (typeof response === 'string' && response.includes('Invalid API key')) {
            throw new Error('Ungültiger API-Schlüssel für das Lexikon.');
          }
          return response as MerriamWebsterEntry[];
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

        // Fix: Rückgabe als valides HttpResourceRequest-Objekt
        return {
          url: `${baseUrl}/${encodeURIComponent(word.trim())}`,
          method: 'GET',
          params: { key: apiKey },
        };
      },
      {
        // Fix: 'parse' statt 'map' für die Transformation/Validierung nutzen
        parse: (response: any) => {
          if (typeof response === 'string' && response.includes('Invalid API key')) {
            throw new Error('Ungültiger API-Schlüssel für den Thesaurus.');
          }
          return response as MerriamWebsterThesaurusEntry[];
        },
      },
    );
  }
}
