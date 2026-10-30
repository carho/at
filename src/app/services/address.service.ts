import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { Address, NewAddress, AddressResponse } from '../models/address.model';
import { Observable, tap } from 'rxjs';

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

  // --- Zustands-Signals ---
  columnFilters = signal<ColumnFilters>({
    firstName: '',
    lastName: '',
    city: '',
    category: '',
  });

  currentPage = signal<number>(1);
  pageSize = signal<number>(5);
  sortField = signal<string>('lastName');
  sortOrder = signal<'asc' | 'desc'>('asc');

  // --- RXRESOURCE (Zentrales Laden) ---
  // Verwende hier 'params' statt 'request' und 'stream' statt 'loader'
  private addressesResource = rxResource({
    params: () => ({
      page: this.currentPage().toString(),
      limit: this.pageSize().toString(),
      sort: this.sortField(),
      order: this.sortOrder(),
      filterFirstName: this.columnFilters().firstName,
      filterLastName: this.columnFilters().lastName,
      filterCity: this.columnFilters().city,
      filterCategory: this.columnFilters().category,
    }),
    stream: (ctx) => {
      // ctx.request enthält die oben definierten Parameter
      return this.http.get<AddressResponse>(this.apiUrl, { params: ctx.params });
    },
  });

  // --- Computed Signals (Typen werden nun sauber aus AddressResponse abgeleitet) ---
  addressesSignal = computed<Address[]>(() => this.addressesResource.value()?.data ?? []);
  totalItems = computed<number>(() => this.addressesResource.value()?.total ?? 0);
  totalPages = computed<number>(() => this.addressesResource.value()?.totalPages ?? 0);
  isLoading = this.addressesResource.isLoading;

  // --- Zustandsänderungen ---
  updateColumnFilter(key: keyof ColumnFilters, value: string): void {
    this.columnFilters.update((filters) => ({
      ...filters,
      [key]: value,
    }));
    this.currentPage.set(1);
  }

  changeSort(field: string): void {
    if (this.sortField() === field) {
      this.sortOrder.update((order) => (order === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortField.set(field);
      this.sortOrder.set('asc');
    }
    this.currentPage.set(1);
  }

  // Fehlerbehebung für 'addr' implicitly has an 'any' type:
  // Durch die obige explizite Typisierung von computed<Address[]> weiß TS jetzt, was addr ist!
  getAddressById(id: string): Address | undefined {
    return this.addressesSignal().find((addr: Address) => addr.id === id);
  }

  // --- CRUD Operations ---
  addAddress(newAddress: NewAddress): Observable<{ id: string }> {
    return this.http
      .post<{ id: string }>(this.apiUrl, newAddress)
      .pipe(tap(() => this.addressesResource.reload()));
  }

  updateAddress(updated: Address): Observable<void> {
    return this.http
      .put<void>(`${this.apiUrl}/${updated.id}`, updated)
      .pipe(tap(() => this.addressesResource.reload()));
  }

  deleteAddress(id: string): void {
    console.log(`📤 Sende Löschauftrag für ID ${id} an das Backend...`);

    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        console.log(`✅ Eintrag ${id} erfolgreich in DB gelöscht.`);

        if (this.addressesSignal().length === 1 && this.currentPage() > 1) {
          this.currentPage.update((p) => p - 1);
        } else {
          this.addressesResource.reload();
        }
      },
      error: (err: unknown) => {
        console.error('❌ Fehler beim Löschvorgang im Service:', err);
        alert('Der Eintrag konnte nicht gelöscht werden.');
      },
    });
  }
}
