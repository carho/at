import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Address, NewAddress } from '../models/address.model';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/addresses';
  // 1. Dieses Signal FEHLT vermutlich bei dir – füge es wieder ein:
  searchQuery = signal<string>('');
  private addressesSignal = signal<Address[]>([]);
  addresses = computed(() => this.addressesSignal());

  filteredAddresses = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.addressesSignal();

    return this.addressesSignal().filter(
      (addr) =>
        addr.firstName.toLowerCase().includes(query) ||
        addr.lastName.toLowerCase().includes(query) ||
        addr.city.toLowerCase().includes(query),
    );
  });

  constructor() {
    this.loadAddresses();
  }

  // GET von PostgreSQL
  loadAddresses(): void {
    this.http.get<Address[]>(this.apiUrl).subscribe({
      next: (data) => this.addressesSignal.set(data),
      error: (err) => console.error('Fehler beim Laden der DB-Einträge:', err),
    });
  }

  // 1. MUSS ein Observable zurückgeben (beachte das 'return'!)
  addAddress(newAddress: NewAddress): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.apiUrl, newAddress).pipe(
      tap({
        next: (response) => {
          const addedItem: Address = { ...newAddress, id: response.id };
          this.addressesSignal.update((list) => [...list, addedItem]);
        },
        error: (err: any) => {
          console.error('❌ Fehler beim Hinzufügen im Service:', err);
        },
      }),
    );
  }

  // 2. MUSS ein Observable zurückgeben (beachte das 'return'!)
  updateAddress(updated: Address): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${updated.id}`, updated).pipe(
      tap({
        next: () => {
          this.addressesSignal.update((list) =>
            list.map((a) => (a.id === updated.id ? updated : a)),
          );
        },
        error: (err: any) => {
          console.error('❌ Fehler beim Update im Service:', err);
        },
      }),
    );
  }

  deleteAddress(id: string): void {
    console.log(`📤 Sende Löschauftrag für ID ${id} an das Backend...`);

    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        // ✅ Wir filtern das Array UND zwingen das Signal durch [...], eine völlig neue Referenz zu erzeugen
        this.addressesSignal.update((currentList) => {
          const filteredList = currentList.filter((item) => item.id !== id);
          return [...filteredList];
        });

        console.log(
          `✅ Frontend-State aktualisiert. Verbleibende Einträge:`,
          this.addressesSignal().length,
        );
      },
      error: (err: unknown) => {
        console.error('❌ Fehler beim Löschen in der Datenbank:', err);
        alert('Der Eintrag konnte nicht gelöscht werden.');
      },
    });
  }

  getAddressById(id: string): Address | undefined {
    return this.addressesSignal().find((a) => a.id === id);
  }
}
