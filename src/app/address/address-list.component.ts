import { Component, inject, signal, computed, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Address } from './address.model';
import { AddressService } from './address.service';

@Component({
  selector: 'app-address-list',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="list-section">
      <!-- Neue Aktionsleiste für Export/Import -->

      <!-- Suchleiste -->
      <div class="search-wrapper">
        <input
          [(ngModel)]="searchQuery"
          placeholder="🔍 Adressen filtern..."
          class="search-input"
        />
        <span class="badge"
          >Einträge: {{ filteredAddresses().length }} / {{ addressService.totalCount() }}</span
        >
      </div>

      <!-- Feedback Meldung für den Import -->
      @if (importMessage()) {
        <div
          class="alert"
          [class.alert-success]="importSuccess()"
          [class.alert-error]="!importSuccess()"
        >
          {{ importMessage() }}
        </div>
      }

      <!-- Grid -->
      <div class="address-grid">
        @for (item of filteredAddresses(); track item.id) {
          <div class="address-card">
            <h3>{{ item.firstName }} {{ item.lastName }}</h3>
            <div class="info-row"><span>📞</span> {{ item.phone }}</div>
            <div class="info-row"><span>✉️</span> {{ item.email }}</div>
            <div class="info-row">
              <span>🏠</span> {{ item.street }}, {{ item.zipCode }} {{ item.city }}
            </div>

            <div class="card-actions">
              <button class="btn-edit" (click)="editRequest.emit(item)">Bearbeiten</button>
              <button class="btn-delete" (click)="addressService.deleteAddress(item.id)">
                Löschen
              </button>
            </div>
          </div>
        } @empty {
          <div class="empty-state">Es wurden keine Adressen gefunden.</div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .list-section {
        margin-top: 20px;
      }
      .action-bar {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
      }
      .btn-action {
        padding: 10px 16px;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        border: 1px solid #cbd5e1;
        display: inline-block;
      }
      .btn-export {
        background: #ffffff;
        color: #1e293b;
      }
      .btn-export:hover {
        background: #f8fafc;
      }
      .btn-import {
        background: #0f172a;
        color: #ffffff;
        border: none;
      }
      .btn-import:hover {
        background: #1e293b;
      }

      .search-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        gap: 16px;
      }
      .search-input {
        flex: 1;
        padding: 12px;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font-size: 1rem;
      }
      .badge {
        background: #f1f5f9;
        padding: 8px 14px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
        color: #475569;
      }

      .alert {
        padding: 12px;
        border-radius: 6px;
        margin-bottom: 20px;
        font-size: 0.9rem;
        font-weight: 500;
      }
      .alert-success {
        background: #f0fdf4;
        color: #15803d;
        border: 1px solid #bbf7d0;
      }
      .alert-error {
        background: #fef2f2;
        color: #b91c1c;
        border: 1px solid #fecaca;
      }

      .address-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
      }
      .address-card {
        background: white;
        border: 1px solid #e2e8f0;
        padding: 20px;
        border-radius: 10px;
      }
      .address-card h3 {
        margin: 0 0 12px 0;
        color: #0f172a;
      }
      .info-row {
        margin-bottom: 6px;
        font-size: 0.9rem;
        color: #475569;
        display: flex;
        gap: 8px;
      }
      .card-actions {
        display: flex;
        gap: 8px;
        margin-top: 16px;
        border-top: 1px solid #f1f5f9;
        padding-top: 12px;
      }
      .card-actions button {
        flex: 1;
        padding: 8px;
        border: none;
        border-radius: 6px;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
      }
      .btn-edit {
        background: #f1f5f9;
        color: #1e293b;
      }
      .btn-delete {
        background: #fee2e2;
        color: #dc2626;
      }
      .empty-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 40px;
        color: #94a3b8;
        background: #f8fafc;
        border-radius: 8px;
        border: 2px dashed #e2e8f0;
      }
    `,
  ],
})
export class AddressListComponent {
  addressService = inject(AddressServiceLocal);
  editRequest = output<Address>();

  searchQuery = signal<string>('');

  // Lokale Signals für die Import-Feedback-Meldungen
  importMessage = signal<string>('');
  importSuccess = signal<boolean>(true);

  filteredAddresses = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const allAddresses = this.addressService.addresses();
    if (!query) return allAddresses;

    return allAddresses.filter(
      (addr) =>
        addr.firstName.toLowerCase().includes(query) ||
        addr.lastName.toLowerCase().includes(query) ||
        addr.city.toLowerCase().includes(query) ||
        addr.email.toLowerCase().includes(query),
    );
  });

  // Aktualisierte Methode in address-list.component.ts

  onFileSelected(event: Event, type: 'json' | 'csv'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      const handleResponse = (success: boolean, message: string) => {
        this.importSuccess.set(success);
        this.importMessage.set(message);
        setTimeout(() => this.importMessage.set(''), 4000);
      };

      if (type === 'json') {
        this.addressService.importFromJSON(file, handleResponse);
      } else if (type === 'csv') {
        this.addressService.importFromCSV(file, handleResponse);
      }

      input.value = ''; // Reset Input
    }
  }
}
