import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { InjectionToken } from '@angular/core';

// 1. Definition des Konfigurations-Interfaces
export interface ApiConfig {
  baseUrl: string;
  apiKey: string;
}

// 2. Erstellen des Injection Tokens
export const API_CONFIG = new InjectionToken<ApiConfig>('app.api.config');

// 3. Die eigentlichen Konfigurationswerte
export const dictionaryConfig: ApiConfig = {
  baseUrl: 'https://www.dictionaryapi.com/api/v3/references/collegiate/json',
  apiKey: '2de172aa-87af-402d-a694-6311ab2cb914',
};


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(routes)
  ]
};
