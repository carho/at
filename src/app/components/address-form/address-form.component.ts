import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AddressService } from '../../services/address.service';
import { NewAddress } from '../../models/address.model';
import { SignalValidatorDirective } from '../../directives/signal-validator.directive';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [FormsModule, RouterLink, SignalValidatorDirective],
  templateUrl: './address-form.component.html',
})
export class AddressFormComponent implements OnInit {
  private addressService = inject(AddressService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  formSubmitted = signal(false);
  isEditMode = signal(false);
  id = signal<string | null>(null);

  // Einzelne Signals für jedes Formularfeld
  firstName = signal('');
  lastName = signal('');
  email = signal('');
  phone = signal('');
  street = signal('');
  city = signal('');
  state = signal('');
  zipCode = signal('');
  country = signal('');
  category = signal<'Personal' | 'Work' | 'Other'>('Personal');

  // NEU: Hilfs-Signals für die flexible Geburtstagseingabe
  birthdayDate = signal('');
  hideYear = signal(false);

  // Validierung via Computed Signals
  isEmailValid = computed(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email());
  });

  isFormValid = computed(() => {
    return (
      this.firstName().trim().length > 0 &&
      this.lastName().trim().length > 0 &&
      this.isEmailValid() &&
      this.phone().trim().length > 0 &&
      this.street().trim().length > 0 &&
      this.city().trim().length > 0 &&
      this.zipCode().trim().length > 0 &&
      this.country().trim().length > 0
    );
  });
  ngOnInit(): void {
    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      this.id.set(paramId);
      this.isEditMode.set(true);

      const data = this.addressService.getAddressById(paramId);
      if (data) {
        this.firstName.set(data.firstName);
        this.lastName.set(data.lastName);
        this.email.set(data.email);
        this.phone.set(data.phone);
        this.street.set(data.street);
        this.city.set(data.city);
        this.state.set(data.state);
        this.zipCode.set(data.zipCode);
        this.country.set(data.country);
        this.category.set(data.category);

        // 🔄 FIX BEIM LADEN:
        if (data.birthday) {
          if (data.birthday.startsWith('--')) {
            this.hideYear.set(true);
            // Setzt das Feld auf '2000-10-02', damit der HTML5-Picker es visuell anzeigen kann
            this.birthdayDate.set(`2000-${data.birthday.substring(2)}`);
          } else {
            this.hideYear.set(false);
            this.birthdayDate.set(data.birthday);
          }
        }
      }
    }
  }

  onSubmit(): void {
    this.formSubmitted.set(true);

    if (!this.isFormValid()) {
      alert('Bitte fülle alle Pflichtfelder aus!');
      return;
    }

    // 🔄 FIX BEIM SPEICHERN:
    let formattedBirthday: string | null = null;

    if (this.birthdayDate()) {
      const dateObj = new Date(this.birthdayDate());
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');

      if (this.hideYear()) {
        // Wenn das Jahr verborgen werden soll, erzwingen wir das Präfix '--' (z.B. --10-02)
        formattedBirthday = `--${month}-${day}`;
      } else {
        // Ansonsten speichern wir das echte, vom User gewählte Jahr
        const year = dateObj.getFullYear();
        formattedBirthday = `${year}-${month}-${day}`;
      }
    }

    const addressData: NewAddress = {
      firstName: this.firstName(),
      lastName: this.lastName(),
      email: this.email(),
      phone: this.phone(),
      street: this.street(),
      city: this.city(),
      state: this.state(),
      zipCode: this.zipCode(),
      country: this.country(),
      category: this.category(),
      birthday: formattedBirthday, // Korrigierter String wird übermittelt
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
