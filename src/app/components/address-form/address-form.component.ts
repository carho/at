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
  // Hier die Direktive importieren:
  imports: [FormsModule, RouterLink, SignalValidatorDirective],
  templateUrl: './address-form.component.html',
})
export class AddressFormComponent implements OnInit {
  private addressService = inject(AddressService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  formSubmitted = signal(false);
  // Status-Signale für den Modus
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

  // Validierung via Computed Signals (Ersatz für Angular Validators)
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
        // Formular-Signale mit bestehenden Daten befüllen
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
      }
    }
  }
  // ... (Imports bleiben identisch)

  onSubmit(): void {
    this.formSubmitted.set(true);

    if (!this.isFormValid()) {
      alert('Bitte fülle alle Pflichtfelder aus (Stadt und PLZ dürfen nicht leer sein)!');
      return;
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
    };

    const currentId = this.id();

    if (this.isEditMode() && currentId) {
      // FIX: .subscribe() hinzugefügt, da die Methode ein Observable zurückgibt!
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
