import { Injectable, signal, computed, effect } from '@angular/core';
import { Address, AddressFormState } from './address.model';

@Injectable({
  providedIn: 'root',
})
export class AddressServiceLocal {
  private readonly STORAGE_KEY = 'angular_addressbook_data';
  private addressesSignal = signal<Address[]>(this.loadFromStorage());

  addresses = this.addressesSignal.asReadonly();
  totalCount = computed(() => this.addressesSignal().length);

  constructor() {
    effect(() => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.addressesSignal()));
    });
  }

  private loadFromStorage(): Address[] {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      if (storedData) return JSON.parse(storedData) as Address[];
    } catch (e) {
      console.error('Fehler beim Laden:', e);
    }
    return [
      {
        id: '1',
        firstName: 'Max',
        lastName: 'Mustermann',
        email: 'max@mustermann.de',
        phone: '0170-1234567',
        street: 'Hauptstraße 42',
        city: 'Berlin',
        zipCode: '10115',
      },
    ];
  }

  // === EXPORT FUNKTION ===
  exportToJSON(): void {
    const dataStr = JSON.stringify(this.addressesSignal(), null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `adressbuch_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }

  // === IMPORT FUNKTION ===
  // Ergänzung in address.service.ts

  importFromCSV(file: File, callback: (success: boolean, message: string) => void): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0);

        if (lines.length < 2) {
          callback(false, 'Die Datei enthält keine Daten oder keinen Header.');
          return;
        }

        // Header einlesen, um Spaltenreihenfolge zu bestimmen (z.B. firstName,lastName,email,phone,street,city,zipCode)
        const headers = lines[0].split(/[;,]/).map((h) => h.trim().replace(/['"]/g, ''));
        const importedAddresses: Address[] = [];

        for (let i = 1; i < lines.length; i++) {
          // Splitten nach Semikolon oder Komma
          const values = lines[i].split(/[;,]/).map((v) => v.trim().replace(/['"]/g, ''));

          // Zuweisung basierend auf Header-Index
          const record: any = {};
          headers.forEach((header, index) => {
            if (values[index] !== undefined) {
              record[header] = values[index];
            }
          });

          // Pflichtfelder-Validierung
          if (record.firstName && record.lastName && record.email) {
            importedAddresses.push({
              id: record.id || crypto.randomUUID(),
              firstName: record.firstName,
              lastName: record.lastName,
              email: record.email,
              phone: record.phone || '',
              street: record.street || '',
              city: record.city || '',
              zipCode: record.zipCode || '',
            });
          }
        }

        if (importedAddresses.length > 0) {
          // Bestehende Liste mit den neuen CSV-Daten zusammenführen oder ersetzen
          this.addressesSignal.update((existing) => [...existing, ...importedAddresses]);
          callback(true, `${importedAddresses.length} Kontakte erfolgreich aus CSV importiert!`);
        } else {
          callback(
            false,
            'Keine gültigen Datensätze gefunden. Prüfen Sie die Spaltennamen im Header.',
          );
        }
      } catch (error) {
        callback(false, 'Fehler beim Lesen der CSV-Datei.');
      }
    };
    reader.readAsText(file);
  }

  importFromJSON(file: File, callback: (success: boolean, message: string) => void): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);

        // Einfache Strukturprüfung, ob es sich um valide Adressdaten handelt
        if (
          Array.isArray(json) &&
          json.every((item) => item.firstName && item.lastName && item.email)
        ) {
          // IDs neu generieren, um Duplikate im System zu vermeiden
          const validatedData = json.map((item) => ({
            ...item,
            id: item.id || crypto.randomUUID(),
          }));

          // Zustand aktualisieren (bestehende Adressen überschreiben oder zusammenführen)
          this.addressesSignal.set(validatedData);
          callback(true, 'Daten erfolgreich importiert!');
        } else {
          callback(false, 'Ungültiges Dateiformat. Pflichtfelder fehlen.');
        }
      } catch (error) {
        callback(false, 'Fehler beim Lesen der Datei. Keine valide JSON-Datei.');
      }
    };
    reader.readAsText(file);
  }

  addAddress(addressData: AddressFormState): void {
    this.addressesSignal.update((list) => [...list, { ...addressData, id: crypto.randomUUID() }]);
  }

  updateAddress(id: string, addressData: AddressFormState): void {
    this.addressesSignal.update((list) =>
      list.map((addr) => (addr.id === id ? { ...addressData, id } : addr)),
    );
  }

  deleteAddress(id: string): void {
    this.addressesSignal.update((list) => list.filter((addr) => addr.id !== id));
  }
}
