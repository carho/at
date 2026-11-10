import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { InjectionToken } from '@angular/core';

export interface MerriamWebsterConfig {
dictionary: {
  baseUrl: string;
  apiKey: string;
};
thesaurus: {
  baseUrl: string;
  apiKey: string;
};
}

// 2. Erstellen des Injection Tokens
export const API_CONFIG = new InjectionToken<MerriamWebsterConfig>('app.api.config');

// 3. Die eigentlichen Konfigurationswerte
export const dictionaryConfig: MerriamWebsterConfig = {
  dictionary: {
    baseUrl: 'https://www.dictionaryapi.com/api/v3/references/collegiate/json',
    apiKey: '2de172aa-87af-402d-a694-6311ab2cb914',
  },
  thesaurus: {
    baseUrl: 'https://dictionaryapi.com/api/v3/references/thesaurus/json',
    apiKey: 'b0d80d8f-0bba-4fb5-b582-9b27fe65ace2x', // Hier den Thesaurus-Key eintragen
  },
};


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(routes)
  ]
};
