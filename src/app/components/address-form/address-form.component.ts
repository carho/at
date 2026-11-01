import { Component, inject, OnInit, signal, computed, linkedSignal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { form, FormField, required, email  } from '@angular/forms/signals';
import { AddressService } from '../../services/address.service';
import { NewAddress } from '../../models/address.model';
import { HttpErrorResponse } from '@angular/common/http';
import { FormFieldComponent } from '../../directives/form-field.component.';
import { germanZipCode, countryDependentZipCode } from '../../validators/zip-code.validator';
import { validBirthday } from '../../validators/birthday.validator';

interface AddressFormModel {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  category: 'Personal' | 'Work' | 'Other';
  birthdayDate: string;
  hideYear: boolean;
}

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [RouterLink, FormField, FormFieldComponent],
  templateUrl: './address-form.component.html',
})
export class AddressFormComponent implements OnInit {
  private addressService = inject(AddressService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  formSubmitted = signal(false);
  isEditMode = signal(false);
  id = signal<string | null>(null);

  countries = signal([
    { code: 'Deutschland', name: 'Deutschland' },
    { code: 'Österreich', name: 'Österreich' },
    { code: 'Schweiz', name: 'Schweiz' },
  ]);

  days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

  formModel = signal<AddressFormModel>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    category: 'Personal',
    birthdayDate: '',
    hideYear: false,
  });

  addressForm = form(this.formModel, (schema) => {
    required(schema.firstName); // Markiert Vorname als Pflichtfeld
    required(schema.lastName);
    required(schema.email);
    email(schema.email); // Validiert echtes E-Mail-Format
    required(schema.phone);
    required(schema.street);
    required(schema.city);
    required(schema.zipCode);
    required(schema.country);

    countryDependentZipCode(schema.zipCode, schema.country);
    // NEU: Geburtstag basierend auf der hideYear-Checkbox validieren
    validBirthday(schema.birthdayDate, schema.hideYear);
  });

  selectedDay = linkedSignal({
    source: () => this.formModel().birthdayDate,
    computation: (birthdayDate) => {
      const parts = birthdayDate.split('-');
      return parts.length === 3 ? parts[2] : '';
    },
  });

  selectedMonth = linkedSignal({
    source: () => this.formModel().birthdayDate,
    computation: (birthdayDate) => {
      const parts = birthdayDate.split('-');
      return parts.length === 3 ? parts[1] : '';
    },
  });

  // Dynamischer Text für das Hauptlabel
  birthdayLabel = computed(() => {
    return this.formModel().hideYear
      ? 'Geburtstag (Ohne Jahreszahl)'
      : 'Exaktes Geburtsdatum (Optional)';
  });

  constructor() {}

  onDayChange(day: string): void {
    this.selectedDay.set(day);
    const currentMonth = this.selectedMonth() || '01';
    this.formModel.update((m) => ({ ...m, birthdayDate: `2000-${currentMonth}-${day}` }));
  }

  onMonthChange(month: string): void {
    this.selectedMonth.set(month);
    const currentDay = this.selectedDay() || '01';
    this.formModel.update((m) => ({ ...m, birthdayDate: `2000-${month}-${currentDay}` }));
  }

  ngOnInit(): void {
    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      this.id.set(paramId);
      this.isEditMode.set(true);

      const data = this.addressService.getAddressById(paramId);
      if (data) {
        let bDayDate = '';
        let bDayHideYear = false;

        if (data.birthday) {
          if (data.birthday.startsWith('--')) {
            bDayHideYear = true;
            bDayDate = `2000-${data.birthday.substring(2)}`;
          } else {
            bDayHideYear = false;
            bDayDate = data.birthday;
          }
        }

        this.formModel.set({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          street: data.street || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode || '',
          country: data.country || '',
          category: (data.category as 'Personal' | 'Work' | 'Other') || 'Personal',
          birthdayDate: bDayDate,
          hideYear: bDayHideYear,
        });
      }
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.formSubmitted.set(true);

    // 1. KORREKTUR: Nutze markAsTouched() auf dem Zustandsobjekt
    this.addressForm().markAsTouched();

    // 2. KORREKTUR: Gültigkeit über das Signal auf dem Zustand abfragen
    if (!this.addressForm().valid()) {
      alert('Bitte fülle alle Pflichtfelder korrekt aus!');
      return;
    }

    const currentModel = this.formModel();
    // ... restlicher Code bleibt identisch
    let formattedBirthday: string | null = null;

    if (currentModel.birthdayDate) {
      const dateObj = new Date(currentModel.birthdayDate);
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');

      if (currentModel.hideYear) {
        formattedBirthday = `--${month}-${day}`;
      } else {
        const year = dateObj.getFullYear();
        formattedBirthday = `${year}-${month}-${day}`;
      }
    }

    const addressData: NewAddress = {
      firstName: currentModel.firstName,
      lastName: currentModel.lastName,
      email: currentModel.email,
      phone: currentModel.phone,
      street: currentModel.street,
      city: currentModel.city,
      state: currentModel.state,
      zipCode: currentModel.zipCode,
      country: currentModel.country,
      category: currentModel.category,
      birthday: formattedBirthday,
    };

    const currentId = this.id();

    if (this.isEditMode() && currentId) {
      this.addressService.updateAddress({ id: currentId, ...addressData }).subscribe({
        next: () => this.router.navigate(['/']),
        error: (err) => this.handleError(err),
      });
    } else {
      this.addressService.addAddress(addressData).subscribe({
        next: () => this.router.navigate(['/']),
        error: (err) => this.handleError(err),
      });
    }
  }

  private handleError(err: unknown): void {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 409) {
        alert((err.error as any).message || 'Eintrag existiert bereits.');
      } else {
        alert('Ein unerwarteter Serverfehler ist aufgetreten.');
      }
    } else {
      alert('Ein unbekannter Fehler ist aufgetreten.');
    }
  }
}
