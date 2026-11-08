/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { AppComponent } from './app/app';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { importProvidersFrom } from '@angular/core';
import { API_CONFIG, dictionaryConfig } from './app/app.config';

bootstrapApplication(AppComponent, {
  providers: [
    // Aktiviert das Routing und die automatische Übergabe von ID-Parametern an Komponenten
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    importProvidersFrom(NgbModule),
    { provide: API_CONFIG, useValue: dictionaryConfig },
  ],
}).catch((err) => console.error(err));
