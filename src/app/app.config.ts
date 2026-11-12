import { ApplicationConfig, provideBrowserGlobalErrorListeners, InjectionToken } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

// 1. Interface um Wikipedia erweitert (und allgemein benannt, optional auch weiter als MerriamWebsterConfig nutzbar)
export interface AppApiConfig {
  dictionary: {
    baseUrl: string;
    apiKey: string;
  };
  thesaurus: {
    baseUrl: string;
    apiKey: string;
  };
  wikipedia: {
    baseUrl: string;
  };
}

// 2. Erstellen des Injection Tokens
export const API_CONFIG = new InjectionToken<AppApiConfig>('app.api.config');

// 3. Die eigentlichen Konfigurationswerte
export const apiConfigValues: AppApiConfig = {
  dictionary: {
    baseUrl: 'https:///www.dictionaryapi.com/api/v3/references/collegiate/json',
    apiKey: '2de172aa-87af-402d-a694-6311ab2cb914',
  },
  thesaurus: {
    baseUrl: 'https://dictionaryapi.com/api/v3/references/thesaurus/json',
    apiKey: 'b0d80d8f-0bba-4fb5-b582-9b27fe65ace2', // Hier den Thesaurus-Key eintragen
  },
  wikipedia: {
    baseUrl: 'https://de.wikipedia.org/w/api.php',
  },
};



 export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(routes),
  ],
};

