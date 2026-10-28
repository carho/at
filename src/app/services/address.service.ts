import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Address, NewAddress, AddressResponse } from '../models/address.model';
import { Observable, tap } from 'rxjs';

// Struktur für die Spaltenfilterung
export interface ColumnFilters {
  firstName: string;
  lastName: string;
  city: string;
  category: string;
}

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/addresses';

  // --- 1. STATE SIGNALS (Zustand) ---
  // Reaktives Objekt für alle aktiven Spaltenfilter
  columnFilters = signal<ColumnFilters>({
    firstName: '',
    lastName: '',
    city: '',
    category: '',
  });

  // Pagination & Sortierung Steuer-Signals
  currentPage = signal<number>(1);
  pageSize = signal<number>(5);
  sortField = signal<string>('lastName');
  sortOrder = signal<'asc' | 'desc'>('asc');

  // Daten- und Server-Metadaten-Signals
  addressesSignal = signal<Address[]>([]);
  totalItems = signal<number>(0);
  totalPages = signal<number>(0);

  constructor() {
    // Der reaktive Effekt überwacht alle darin gelesenen Signals.
    // Sobald sich currentPage, pageSize, sortField, sortOrder oder columnFilters
    // ändern, wird die Methode loadAddresses() vollautomatisch erneut ausgeführt.
    effect(() => {
      this.loadAddresses();
    });
  }

  // --- 2. DATA LOADING (Daten abrufen) ---
  loadAddresses(): void {
    const filters = this.columnFilters();

    // Query-Parameter für das Express-Backend aufbereiten
    const params = {
      page: this.currentPage().toString(),
      limit: this.pageSize().toString(),
      sort: this.sortField(),
      order: this.sortOrder(),
      filterFirstName: filters.firstName,
      filterLastName: filters.lastName,
      filterCity: filters.city,
      filterCategory: filters.category,
    };

    this.http.get<AddressResponse>(this.apiUrl, { params }).subscribe({
      next: (response) => {
        this.addressesSignal.set(response.data);
        this.totalItems.set(response.total);
        this.totalPages.set(response.totalPages);
      },
      error: (err: unknown) => {
        console.error('❌ Fehler beim Laden der paginierten Daten im Service:', err);
      },
    });
  }

  // --- 3. STATE MUTATIONS (Zustandsänderungen) ---
  // Aktualisiert reaktiv ein einzelnes Feld in der Spaltenfilterung
  updateColumnFilter(key: keyof ColumnFilters, value: string): void {
    this.columnFilters.update((filters) => ({
      ...filters,
      [key]: value,
    }));
    this.currentPage.set(1); // Bei jeder Filter-Änderung sicherheitshalber zurück auf Seite 1
  }

  // Schaltet die Sortierspalte um oder invertiert die Richtung
  changeSort(field: string): void {
    if (this.sortField() === field) {
      this.sortOrder.update((order) => (order === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortField.set(field);
      this.sortOrder.set('asc');
    }
    this.currentPage.set(1); // Nach Sortierung zurück auf Seite 1 springen
  }

  // Sucht eine Adresse anhand der ID aus den lokal geladenen Daten der aktuellen Seite raus
  getAddressById(id: string): Address | undefined {
    return this.addressesSignal().find((addr) => addr.id === id);
  }

  // --- 4. CRUD OPERATIONS (Datenmodifikationen) ---
  // POST: Sendet neue Adresse an PostgreSQL und triggert Daten-Refresh
  addAddress(newAddress: NewAddress): Observable<{ id: string }> {
    return this.http
      .post<{ id: string }>(this.apiUrl, newAddress)
      .pipe(tap(() => this.loadAddresses()));
  }

  // PUT: Aktualisiert bestehende Adresse und triggert Daten-Refresh
  updateAddress(updated: Address): Observable<void> {
    return this.http
      .put<void>(`${this.apiUrl}/${updated.id}`, updated)
      .pipe(tap(() => this.loadAddresses()));
  }

  // DELETE: Löscht eine Adresse und korrigiert bei Bedarf den Seiten-Index
  deleteAddress(id: string): void {
    console.log(`📤 Sende Löschauftrag für ID ${id} an das Backend...`);

    // responseType: 'json' ist Standard. Backend antwortet mit {}, was valides JSON ist.
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        console.log(`✅ Eintrag ${id} erfolgreich in DB gelöscht.`);

        // Falls auf der aktuellen Seite der letzte verbleibende Eintrag gelöscht wurde
        // und wir uns nicht auf Seite 1 befinden, springen wir eine Seite zurück.
        if (this.addressesSignal().length === 1 && this.currentPage() > 1) {
          this.currentPage.update((p) => p - 1);
        } else {
          // Ansonsten laden wir die aktuelle Seite frisch nach, um Nachfolgedaten nachzurücken
          this.loadAddresses();
        }
      },
      error: (err: unknown) => {
        console.error('❌ Fehler beim Löschvorgang im Service:', err);
        alert('Der Eintrag konnte nicht gelöscht werden. Bitte überprüfe die Server-Verbindung.');
      },
    });
  }
}
