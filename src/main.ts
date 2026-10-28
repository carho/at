import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { AppComponent } from './app/app';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    // Aktiviert das Routing und die automatische Übergabe von ID-Parametern an Komponenten
    provideRouter(routes, withComponentInputBinding()),
  ],
}).catch((err) => console.error(err));
