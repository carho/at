import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Address, NewAddress, AddressResponse } from '../models/address.model';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/addresses';
  searchQuery = signal<string>('');
  // State Signals für Pagination & Sorting
  currentPage = signal<number>(1);
  pageSize = signal<number>(5);
  sortField = signal<string>('lastName');
  sortOrder = signal<'asc' | 'desc'>('asc');

  // Daten- und Metadaten-Signals
  addressesSignal = signal<Address[]>([]);
  totalItems = signal<number>(0);
  totalPages = signal<number>(0);

  constructor() {
    // Ein Effect triggert das Nachladen von der DB vollautomatisch,
    // sobald sich eines der Steuersignale (Page, Size, Sort, Order) ändert!
    effect(() => {
      this.loadAddresses();
    });
  }

  loadAddresses(): void {
    const params = {
      page: this.currentPage().toString(),
      limit: this.pageSize().toString(),
      sort: this.sortField(),
      order: this.sortOrder(),
    };

    this.http.get<AddressResponse>(this.apiUrl, { params }).subscribe({
      next: (response) => {
        this.addressesSignal.set(response.data);
        this.totalItems.set(response.total);
        this.totalPages.set(response.totalPages);
      },
      error: (err) => console.error('Fehler beim Laden der paginierten Daten:', err),
    });
  }

  // Hilfsmethode fürs Umschalten der Sortierung
  changeSort(field: string): void {
    if (this.sortField() === field) {
      // Wenn das Feld schon aktiv ist, Richtung umkehren
      this.sortOrder.update((order) => (order === 'asc' ? 'desc' : 'asc'));
    } else {
      // Neues Feld aktivieren, Richtung auf Standard 'asc'
      this.sortField.set(field);
      this.sortOrder.set('asc');
    }
    this.currentPage.set(1); // Bei Sortierung zurück auf Seite 1 springen
  }

  // CRUD-Operationen rufen nach Erfolg einfach loadAddresses() auf, um die aktuelle Seite frisch zu laden
  addAddress(newAddress: NewAddress): Observable<{ id: string }> {
    return this.http
      .post<{ id: string }>(this.apiUrl, newAddress)
      .pipe(tap(() => this.loadAddresses()));
  }

  updateAddress(updated: Address): Observable<void> {
    return this.http
      .put<void>(`${this.apiUrl}/${updated.id}`, updated)
      .pipe(tap(() => this.loadAddresses()));
  }

  deleteAddress(id: string): void {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        // Falls auf der aktuellen Seite der letzte Eintrag gelöscht wurde, eine Seite zurückspringen
        if (this.addressesSignal().length === 1 && this.currentPage() > 1) {
          this.currentPage.update((p) => p - 1);
        } else {
          this.loadAddresses();
        }
      },
      error: (err) => console.error('Fehler beim Löschen:', err),
    });
  }
  getAddressById(id: string): Address | undefined {
    return this.addressesSignal().find((addr) => addr.id === id);
  }
}
