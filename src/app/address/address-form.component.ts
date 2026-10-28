import { Component, inject, input, output, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Address, AddressFormState, createEmptyForm } from './address.model';
import { AddressServiceLocal } from './address.service-local';

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="form-card">
      <h2>{{ editData() ? '✏️ Adresse bearbeiten' : '➕ Neue Adresse hinzufügen' }}</h2>

      <form (ngSubmit)="handleSubmit()" #form="ngForm">
        <div class="form-row">
          <input
            [(ngModel)]="formState().firstName"
            name="firstName"
            placeholder="Vorname"
            required
          />
          <input
            [(ngModel)]="formState().lastName"
            name="lastName"
            placeholder="Nachname"
            required
          />
        </div>

        <div class="form-row">
          <input
            [(ngModel)]="formState().email"
            name="email"
            type="email"
            placeholder="E-Mail"
            required
          />
          <input
            [(ngModel)]="formState().phone"
            name="phone"
            placeholder="Telefonnummer"
            required
          />
        </div>

        <div class="form-row full-width">
          <input
            [(ngModel)]="formState().street"
            name="street"
            placeholder="Straße und Hausnummer"
            required
          />
        </div>

        <div class="form-row">
          <input [(ngModel)]="formState().zipCode" name="zipCode" placeholder="PLZ" required />
          <input [(ngModel)]="formState().city" name="city" placeholder="Stadt" required />
        </div>

        <div class="form-actions">
          <button type="submit" [disabled]="!form.valid" class="btn-submit">Speichern</button>
          @if (editData()) {
            <button type="button" class="btn-cancel" (click)="cancelEdit.emit()">Abbrechen</button>
          }
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .form-card {
        background: #ffffff;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        margin-bottom: 30px;
      }
      h2 {
        margin-top: 0;
        color: #1e293b;
        font-size: 1.4rem;
        margin-bottom: 20px;
      }
      .form-row {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
      }
      .full-width input {
        width: 100%;
      }
      input {
        flex: 1;
        padding: 12px;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        font-size: 0.95rem;
        transition: border 0.2s;
      }
      input:focus {
        border-color: #3b82f6;
        outline: none;
      }
      .form-actions {
        display: flex;
        gap: 12px;
        margin-top: 20px;
      }
      button {
        padding: 12px 24px;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        font-size: 0.95rem;
      }
      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .btn-submit {
        background: #2563eb;
        color: white;
      }
      .btn-cancel {
        background: #64748b;
        color: white;
      }
    `,
  ],
})
export class AddressFormComponent {
  private addressService = inject(AddressServiceLocal);

  // Inputs und Outputs via moderner Signal-Syntax
  editData = input<Address | null>(null);
  cancelEdit = output<void>();

  // Lokaler Formularzustand als reaktives Writable Signal
  formState = signal<AddressFormState>(createEmptyForm());

  constructor() {
    // Effekt synchronisiert den Formular-Zustand reaktiv, sobald sich das editData-Signal ändert
    effect(() => {
      const activeAddress = this.editData();
      if (activeAddress) {
        // Zustand mit Kopie der editierbaren Daten befüllen
        this.formState.set({ ...activeAddress });
      } else {
        this.formState.set(createEmptyForm());
      }
    });
  }

  handleSubmit(): void {
    const activeAddress = this.editData();

    if (activeAddress) {
      this.addressService.updateAddress(activeAddress.id, this.formState());
      this.cancelEdit.emit(); // Bearbeitungsmodus beenden
    } else {
      this.addressService.addAddress(this.formState());
    }

    this.formState.set(createEmptyForm());
  }
}
