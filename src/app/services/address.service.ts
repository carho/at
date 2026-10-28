import { Injectable, signal, computed } from '@angular/core';
import { Address, NewAddress } from '../models/address.model';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private addressesSignal = signal<Address[]>([
    {
      id: '1',
      firstName: 'Max',
      lastName: 'Mustermann',
      email: 'max@example.com',
      phone: '+49 123 456789',
      street: 'Main Street 1',
      city: 'Berlin',
      state: 'Berlin',
      zipCode: '10115',
      country: 'Germany',
      category: 'Work',
    },
  ]);

  searchQuery = signal<string>('');
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

  addAddress(newAddress: NewAddress): void {
    this.addressesSignal.update((list) => [...list, { ...newAddress, id: crypto.randomUUID() }]);
  }

  updateAddress(updated: Address): void {
    this.addressesSignal.update((list) => list.map((a) => (a.id === updated.id ? updated : a)));
  }

  deleteAddress(id: string): void {
    this.addressesSignal.update((list) => list.filter((a) => a.id !== id));
  }

  getAddressById(id: string): Address | undefined {
    return this.addressesSignal().find((a) => a.id === id);
  }
}
