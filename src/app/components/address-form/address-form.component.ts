import { Component, inject, OnInit, signal, computed, linkedSignal, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { form, FormField, required, email, disabled } from '@angular/forms/signals';
import { AddressService } from '../../services/address.service';
import { NewAddress } from '../../models/address.model';
import { HttpErrorResponse } from '@angular/common/http';
import { FormFieldComponent } from '../../directives/form-field.component.';
import { germanZipCode, countryDependentZipCode } from '../../validators/zip-code.validator';
import { validBirthday } from '../../validators/birthday.validator';
// NEU: Angular Material Imports
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';

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
  // NEU: Teilfelder für die reaktive Signal-Forms-Bindung
  birthdayDay: string;
  birthdayMonth: string;

};

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [
    RouterLink,
    FormField,
    FormFieldComponent,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
  ],
  providers: [
    // NEU: Deutsches Datumsformat (TT.MM.JJJJ) erzwingen
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
    provideNativeDateAdapter(),
  ],
  templateUrl: './address-form.component.html',
})
export class AddressFormComponent implements OnInit {
  private addressService = inject(AddressService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  formSubmitted = signal(false);
  isEditMode = signal(false);
  id = signal<string | null>(null);
  // 1. Daten-Map für die Bundesländer oberhalb oder innerhalb der Klasse definieren

  private readonly statesPerCountry: Record<string, string[]> = {
    Deutschland: [
      'Baden-Württemberg',
      'Bayern',
      'Berlin',
      'Brandenburg',
      'Bremen',
      'Hamburg',
      'Hessen',
      'Mecklenburg-Vorpommern',
      'Niedersachsen',
      'Nordrhein-Westfalen',
      'Rheinland-Pfalz',
      'Saarland',
      'Sachsen',
      'Sachsen-Anhalt',
      'Schleswig-Holstein',
      'Thüringen',
    ],
    Österreich: [
      'Burgenland',
      'Kärnten',
      'Niederösterreich',
      'Oberösterreich',
      'Salzburg',
      'Steiermark',
      'Tirol',
      'Vorarlberg',
      'Wien',
    ],
    Schweiz: [
      'Aargau',
      'Appenzell Ausserrhoden',
      'Appenzell Innerrhoden',
      'Basel-Landschaft',
      'Basel-Stadt',
      'Bern',
      'Freiburg',
      'Genf',
      'Glarus',
      'Graubünden',
      'Jura',
      'Luzern',
      'Neuenburg',
      'Nidwalden',
      'Obwalden',
      'Schaffhausen',
      'Schwyz',
      'Solothurn',
      'St. Gallen',
      'Thurgau',
      'Tessin',
      'Uri',
      'Waadt',
      'Wallis',
      'Zug',
      'Zürich',
    ],
  };
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
    birthdayDay: '', // Initial leer
    birthdayMonth: '', // Initial leer
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
    // NEU & REAKTIV: Das Bundesland sperren, wenn keine Bundesländer zur Auswahl stehen
    // Wir nutzen hierfür das stabile Konfigurations-Objekt der v22 API
    disabled(schema.state, {
      when: () => this.filteredStates().length === 0,
    });
  });

  // Dieses Signal berechnet die verfügbaren Bundesländer jedes Mal neu, wenn sich das Land ändert!
  filteredStates = computed(() => {
    const selectedCountry = this.formModel().country;
    return this.statesPerCountry[selectedCountry] || [];
  });
  // Berechnet den Tag live und fängt Strings sowie Date-Objekte gleichermaßen ab
  readonly selectedDay = computed(() => {
    const birthdayDate = this.formModel().birthdayDate;
    if (!birthdayDate) return '';

    const date = new Date(birthdayDate);
    if (isNaN(date.getTime())) return '';
    return String(date.getDate()).padStart(2, '0');
  });

  // Berechnet den Monat live und fängt Strings sowie Date-Objekte gleichermaßen ab
  readonly selectedMonth = computed(() => {
    const birthdayDate = this.formModel().birthdayDate;
    if (!birthdayDate) return '';

    const date = new Date(birthdayDate);
    if (isNaN(date.getTime())) return '';
    return String(date.getMonth() + 1).padStart(2, '0');
  });


  // Dynamischer Text für das Hauptlabel
  birthdayLabel = computed(() => {
    return this.formModel().hideYear
      ? 'Geburtstag (Ohne Jahreszahl)'
      : 'Exaktes Geburtsdatum (Optional)';
  });

  constructor() {}

  // Die Änderungs-Methoden aktualisieren nun sowohl die Teilfelder als auch das Hauptfeld
  onDayChange(day: string): void {
    const currentMonth = this.formModel().birthdayMonth || '01';
    this.formModel.update((m) => ({
      ...m,
      birthdayDay: day,
      birthdayDate: `2000-${currentMonth}-${day}`,
    }));
    this.addressForm.birthdayDate().markAsDirty();
  }

  onMonthChange(month: string): void {
    const currentDay = this.formModel().birthdayDay || '01';
    this.formModel.update((m) => ({
      ...m,
      birthdayMonth: month,
      birthdayDate: `2000-${month}-${currentDay}`,
    }));
    this.addressForm.birthdayDate().markAsDirty();
  }
  // Synchronisiert die Kalendereingabe als standardisierten String zurück ins Modell
  onDateChange(event: any): void {
    if (event.value) {
      const date = new Date(event.value);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        this.formModel.update((m) => ({
          ...m,
          birthdayDate: `${year}-${month}-${day}`,
          birthdayDay: day,
          birthdayMonth: month,
        }));
      }
    }
    this.addressForm.birthdayDate().markAsDirty();
  }

  // Im ngOnInit erweitern wir das Laden der Daten:
  ngOnInit(): void {
    const paramId = this.route.snapshot.paramMap.get('id');
    if (paramId) {
      this.id.set(paramId);
      this.isEditMode.set(true);

      const data = this.addressService.getAddressById(paramId);
      if (data) {
        let bDayDate = '';
        let bDayHideYear = false;
        let extractedDay = '';
        let extractedMonth = '';

        if (data.birthday) {
          if (data.birthday.startsWith('--')) {
            bDayHideYear = true;
            bDayDate = `2000-${data.birthday.substring(2)}`;
          } else {
            bDayHideYear = false;
            bDayDate = data.birthday;
          }

          // Teile das Datum direkt beim Laden starr auf
          const parts = bDayDate.split('-');
          if (parts.length === 3) {
            extractedMonth = parts[1];
            extractedDay = parts[2];
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
          birthdayDay: extractedDay, // Jetzt nativ im Signal-Formular hinterlegt
          birthdayMonth: extractedMonth, // Jetzt nativ im Signal-Formular hinterlegt
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
