import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { form, FormField } from '@angular/forms/signals'; // <-- Aus dem neuen Signal-Forms-Paket importiert
import { AddressService } from '../../services/address.service';
import { NewAddress } from '../../models/address.model';
import { HttpErrorResponse } from '@angular/common/http';
import { FormFieldComponent } from '../../directives/form-field.component.';

// Interface für das Formular-Datenmodell (Signal Forms verlangt nicht-nullable Primitiven)
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
  imports: [RouterLink, FormField, FormFieldComponent], // <-- FormField-Direktive hier eingebunden
  templateUrl: './address-form.component.html',
})
export class AddressFormComponent implements OnInit {
  private addressService = inject(AddressService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  formSubmitted = signal(false);
  isEditMode = signal(false);
  id = signal<string | null>(null);

  // 1. Das zentrale, beschreibbare Signal-Model für das Formular
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

  // 2. Erstellung des FieldTree über die form()-Hilfsfunktion
  addressForm = form(this.formModel);

  // 3. Validierungsstatus deklarativ über die neuen Signal-Zustände ableiten
  isEmailValid = computed(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.formModel().email);
  });

  isFormValid = computed(() => {
    const m = this.formModel();
    return (
      m.firstName.trim().length > 0 &&
      m.lastName.trim().length > 0 &&
      this.isEmailValid() &&
      m.phone.trim().length > 0 &&
      m.street.trim().length > 0 &&
      m.city.trim().length > 0 &&
      m.zipCode.trim().length > 0 &&
      m.country.trim().length > 0
    );
  });

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

        // Das gesamte Model auf einmal reaktiv aktualisieren
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
    event.preventDefault(); // Verhindert das klassische Browser-Absenden
    this.formSubmitted.set(true);

    if (!this.isFormValid()) {
      alert('Bitte fülle alle Pflichtfelder korrekt aus!');
      return;
    }

    const currentModel = this.formModel();
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
