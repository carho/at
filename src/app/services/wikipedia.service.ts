import { Service, inject, Signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { API_CONFIG } from '../app.config'; // Pfad ggf. prüfen
import { WikipediaEntry } from './interfaces';

@Service()
export class WikipediaService {
  // Konfiguration analog zum MerriamWebsterService injizieren
  private config = inject(API_CONFIG);

  getWikiArticles(searchSignal: Signal<string>) {
    return httpResource<WikipediaEntry[]>(
      () => {
        const query = searchSignal().trim();
        if (!query || query.length <= 1) return undefined;

        // Ausgelagerte URL aus der zentralen Config beziehen
        const { baseUrl } = this.config.wikipedia;

        return {
          url: baseUrl,
          method: 'GET',
          params: {
            action: 'opensearch',
            search: query,
            limit: '5',
            namespace: '0',
            format: 'json',
            origin: '*',
          },
        };
      },
      {
        parse: (response: unknown): WikipediaEntry[] => {
          if (!Array.isArray(response) || response.length < 4) return [];

          const titles: string[] = response || [];
          const descriptions: string[] = response || [];
          const links: string[] = response || [];

          return titles.map((title, index) => ({
            id: title,
            typeBadge: 'Wikipedia',
            description: descriptions[index] || 'Keine Beschreibung verfügbar.',
            link: links[index] || '#',
          }));
        },
      },
    );
  }
}
