import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop'; // <-- Nutzt die Observable-Variante
import { firstValueFrom } from 'rxjs';
import { Address, AddressFormState } from './address.model';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/addresses';
  // === EXPORT FUNKTION ===


  // Ein reaktiver Trigger, um das Neuladen zu steuern
  private refreshTrigger = signal<number>(0);

  // rxResource matched perfekt mit HttpClient und löst den Typenfehler auf
  addressResource = rxResource({
    params: () => ({ trigger: this.refreshTrigger() }), // 'params' statt 'request'
    stream: () => this.http.get<Address[]>(this.apiUrl), // 'stream' statt 'loader'
  });

  // Schreibgeschützte Signale für die Komponenten
  addresses = computed(() => this.addressResource.value() ?? []);
  isLoading = this.addressResource.isLoading;
  totalCount = computed(() => this.addresses().length);

  // POST: Neue Adresse in der DB speichern
  async addAddress(addressData: AddressFormState): Promise<void> {
    await firstValueFrom(this.http.post(this.apiUrl, addressData));
    this.reload();
  }

  // PUT: Adresse in der DB aktualisieren
  async updateAddress(id: string, addressData: AddressFormState): Promise<void> {
    await firstValueFrom(this.http.put(`${this.apiUrl}/${id}`, addressData));
    this.reload();
  }

  // DELETE: Adresse aus der DB entfernen
  async deleteAddress(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
    this.reload();
  }

  // Hilfsmethode zum reaktiven Aktualisieren
  private reload(): void {
    this.refreshTrigger.update((n) => n + 1);
  }
}
