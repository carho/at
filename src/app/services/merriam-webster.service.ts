import { Service, inject, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { httpResource } from '@angular/common/http';
import { API_CONFIG } from '../app.config'; // Pfad anpassen

// Interface für die JSON-Struktur von Merriam-Webster
export interface MerriamWebsterEntry {
  meta: {
    id: string;
    uuid: string;
    section: string;
    stems: string[];
    offensive: boolean;
  };
  fl: string; // Wortart (noun, verb, adjective, etc.)
  shortdef: string[]; // Array mit Kurzdefinitionen
}

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

      return `${this.config.baseUrl}/${encodeURIComponent(word.trim())}?key=${this.config.apiKey}`;
    });
  }
}
