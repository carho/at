import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <!-- Navigationsleiste -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center" routerLink="/">
          <span class="me-2">📇</span> Adressbuch Manager
        </a>
        <div class="navbar-nav shadow-sm">
          <a class="nav-link active" routerLink="/" routerLinkActive="active"> Übersicht </a>
        </div>
      </div>
    </nav>

    <!-- Hauptinhalt (Hier landen die Routen) -->
    <main class="py-4">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [
    `
      .navbar-brand {
        font-weight: 600;
        letter-spacing: 0.5px;
      }
    `,
  ],
})
export class AppComponent {
  title = 'address-management-signals';
}
