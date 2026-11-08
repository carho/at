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
    return httpResource<MerriamWebsterEntry[]>(() => {
      const word = wordSignal();
      if (!word || word.trim() === '') return undefined;

      const { baseUrl, apiKey } = this.config.dictionary;
      return `${baseUrl}/${encodeURIComponent(word.trim())}?key=${apiKey}`;
    });
  }

  /**
   * Thesaurus-Suche
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
