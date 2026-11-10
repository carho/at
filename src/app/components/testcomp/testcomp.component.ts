import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
// Richtiger Import für Angular v22 Signal Forms:
import { form, FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-testcomp',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FormField, // Hier wird direkt die FormField-Direktive importiert
  ],
  templateUrl: './testcomp.component.html',
  // Geändert auf .css, um den Build-Fehler NG2008 zu beheben

})
export class TestcompComponent {
  // 1. Reactive Forms
  reactiveControl = new FormControl('Startwert Reactive');
  reactiveSignal = signal(this.reactiveControl.value || '');

  // 2. Template-driven Forms
  templateValue = 'Startwert Template-driven';

  // 3. Angular v22 Signal Forms
  // Der Wert der Form ist ein ganz normales, beschreibbares Signal
  signalModel = signal({ textValue: 'Startwert Signal Forms' });
  // Die Form-Instanz liest/steuert dieses Signal
  signalForm = form(this.signalModel);

  constructor() {
    // Wert-Synchronisierung für Reactive Forms ins Signal-Array
    this.reactiveControl.valueChanges.subscribe((val) => {
      this.reactiveSignal.set(val || '');
    });
  }

  // Ein berechnetes Signal (computed) reagiert sofort auf alle Änderungen
  inputValuesArray = computed(() => {
    return [
      { type: 'Reactive Form', value: this.reactiveSignal() },
      { type: 'Template-driven Form', value: this.templateValue },
      { type: 'Signal Form (v22)', value: this.signalModel().textValue },
    ];
  });
}
