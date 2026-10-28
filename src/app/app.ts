import { Component, signal } from '@angular/core';
import { AddressFormComponent } from './address/address-form.component';
import { AddressListComponent } from './address/address-list.component';
import { Address } from './address/address.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AddressFormComponent, AddressListComponent],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>📊 AddressHub <span class="version-tag">Signals Native</span></h1>
      </header>

      <main>
        <!-- Das Formular reagiert auf das Signal der ausgewählten Adresse -->
        <app-address-form [editData]="selectedAddress()" (cancelEdit)="selectedAddress.set(null)">
        </app-address-form>

        <!-- Die Liste setzt bei Klick auf "Bearbeiten" die ausgewählte Adresse in das Signal -->
        <app-address-list (editRequest)="selectedAddress.set($event)"> </app-address-list>
      </main>
    </div>
  `,
  styles: [
    `
      .app-container {
        max-width: 1100px;
        margin: 0 auto;
        padding: 40px 20px;
        font-family:
          system-ui,
          -apple-system,
          sans-serif;
        background: #f8fafc;
        min-height: 100vh;
      }
      .app-header {
        margin-bottom: 30px;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 16px;
      }
      .app-header h1 {
        margin: 0;
        color: #0f172a;
        font-size: 1.8rem;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .version-tag {
        font-size: 0.75rem;
        background: #3b82f6;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    `,
  ],
})
export class App {
  // Zentraler Zustand: Steuert, ob das Formular im Erstell-Modus (null) oder Bearbeitungs-Modus (Address) ist
  selectedAddress = signal<Address | null>(null);
}
