import { Service, inject, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { httpResource } from '@angular/common/http';
import { API_CONFIG } from '../app.config'; // Pfad anpassen
import { MerriamWebsterEntry, MerriamWebsterThesaurusEntry } from './interfaces';


@Service() // Neuer v22+ Standard für Dependency Injection
export class MerriamWebsterService {
  private http = inject(HttpClient);
  private config = inject(API_CONFIG);

  /**
   * Holt Definitionen basierend auf einem Wort-Signal.
   * Fängt Race Conditions und doppelte Requests automatisch ab.
   */
  getDefinitions(wordSignal: Signal<string>) {
    return httpResource<MerriamWebsterEntry[]>(() => {
      const word = wordSignal();

      // KORREKTUR: 'undefined' statt 'null' zurückgeben, damit TS2769 verschwindet
      if (!word || word.trim() === '') return undefined;
      const { baseUrl, apiKey } = this.config.dictionary;
      return `${baseUrl}/${encodeURIComponent(word.trim())}?key=${apiKey}`;
    });
  }

  /**
   * Thesaurus-Suche (Nutzt dedizierte Thesaurus-Konfiguration)
   */
  getSynonyms(wordSignal: Signal<string>) {
    return httpResource<MerriamWebsterThesaurusEntry[]>(() => {
      const word = wordSignal();
      if (!word || word.trim() === '') return undefined;

      const { baseUrl, apiKey } = this.config.thesaurus;
      return `${baseUrl}/${encodeURIComponent(word.trim())}?key=${apiKey}`;
    });
  }
}
