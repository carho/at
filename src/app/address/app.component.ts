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

      <form (ngSubmit)="handleSubmit(form)" #form="ngForm" novalidate>
        <!-- Name Row -->
        <div class="form-row">
          <div class="input-group">
            <input
              [(ngModel)]="formState().firstName"
              name="firstName"
              #firstName="ngModel"
              placeholder="Vorname"
              required
              minlength="2"
            />
            @if (firstName.invalid && (firstName.dirty || firstName.touched || form.submitted)) {
              <span class="error-msg">Mindestens 2 Zeichen erforderlich.</span>
            }
          </div>

          <div class="input-group">
            <input
              [(ngModel)]="formState().lastName"
              name="lastName"
              #lastName="ngModel"
              placeholder="Nachname"
              required
              minlength="2"
            />
            @if (lastName.invalid && (lastName.dirty || lastName.touched || form.submitted)) {
              <span class="error-msg">Mindestens 2 Zeichen erforderlich.</span>
            }
          </div>
        </div>

        <!-- Contact Row -->
        <div class="form-row">
          <div class="input-group">
            <input
              [(ngModel)]="formState().email"
              name="email"
              type="email"
              #email="ngModel"
              placeholder="E-Mail (z.B. max@domain.de)"
              required
              pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
            />
            @if (email.invalid && (email.dirty || email.touched || form.submitted)) {
              <span class="error-msg">Bitte eine gültige E-Mail-Adresse angeben.</span>
            }
          </div>

          <div class="input-group">
            <input
              [(ngModel)]="formState().phone"
              name="phone"
              #phone="ngModel"
              placeholder="Telefonnummer (z.B. +49...)"
              required
              pattern="^[0-9+\\s-]{6,20}$"
            />
            @if (phone.invalid && (phone.dirty || phone.touched || form.submitted)) {
              <span class="error-msg"
                >Gültige Nummer erforderlich (nur Zahlen, +, -, Leerzeichen).</span
              >
            }
          </div>
        </div>

        <!-- Street (Full Width) -->
        <div class="form-row full-width">
          <div class="input-group">
            <input
              [(ngModel)]="formState().street"
              name="street"
              #street="ngModel"
              placeholder="Straße und Hausnummer"
              required
            />
            @if (street.invalid && (street.dirty || street.touched || form.submitted)) {
              <span class="error-msg">Straßenangabe ist erforderlich.</span>
            }
          </div>
        </div>

        <!-- Location Row -->
        <div class="form-row">
          <div class="input-group" style="flex: 0 0 30%;">
            <input
              [(ngModel)]="formState().zipCode"
              name="zipCode"
              #zipCode="ngModel"
              placeholder="PLZ (5-stellig)"
              required
              pattern="^[0-9]{5}$"
            />
            @if (zipCode.invalid && (zipCode.dirty || zipCode.touched || form.submitted)) {
              <span class="error-msg">Genau 5 Zahlen.</span>
            }
          </div>

          <div class="input-group">
            <input
              [(ngModel)]="formState().city"
              name="city"
              #city="ngModel"
              placeholder="Stadt"
              required
            />
            @if (city.invalid && (city.dirty || city.touched || form.submitted)) {
              <span class="error-msg">Stadt ist erforderlich.</span>
            }
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-submit">Speichern</button>
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
        align-items: flex-start;
      }
      .full-width {
        width: 100%;
      }
      .input-group {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      input {
        width: 100%;
        padding: 12px;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        font-size: 0.95rem;
        box-sizing: border-box;
        transition: all 0.2s;
      }
      input:focus {
        border-color: #3b82f6;
        outline: none;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
      }

      /* Validierungs-Styling über native Angular-Klassen */
      input.ng-invalid.ng-touched {
        border-color: #ef4444;
        background-color: #fef2f2;
      }

      .error-msg {
        color: #dc2626;
        font-size: 0.8rem;
        margin-top: 4px;
        font-weight: 500;
      }
      .form-actions {
        display: flex;
        gap: 12px;
        margin-top: 8px;
      }
      button {
        padding: 12px 24px;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        font-size: 0.95rem;
      }
      .btn-submit {
        background: #2563eb;
        color: white;
        transition: background 0.2s;
      }
      .btn-submit:hover {
        background: #1d4ed8;
      }
      .btn-cancel {
        background: #64748b;
        color: white;
      }
      .btn-cancel:hover {
        background: #475569;
      }
    `,
  ],
})
export class AddressFormComponent {
  private addressService = inject(AddressServiceLocal);

  editData = input<Address | null>(null);
  cancelEdit = output<void>();

  formState = signal<AddressFormState>(createEmptyForm());

  constructor() {
    effect(() => {
      const activeAddress = this.editData();
      if (activeAddress) {
        this.formState.set({ ...activeAddress });
      } else {
        this.formState.set(createEmptyForm());
      }
    });
  }

  // Übergabe des NgForm-Objekts zur expliziten Validierungsprüfung beim Absenden
  handleSubmit(form: any): void {
    if (form.invalid) {
      // Markiert alle Felder als "touched", um Fehlermeldungen direkt anzuzeigen
      form.control.markAllAsTouched();
      return;
    }

    const activeAddress = this.editData();

    if (activeAddress) {
      this.addressService.updateAddress(activeAddress.id, this.formState());
      this.cancelEdit.emit();
    } else {
      this.addressService.addAddress(this.formState());
    }

    // Formular-Zustand zurücksetzen
    form.resetForm(createEmptyForm());
  }
}
