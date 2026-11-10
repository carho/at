import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl } from '@angular/forms';
import { form } from '@angular/forms/signals';
import { Testcomp2LayoutComponent } from 'testcomp2-layout.component';

@Component({
  selector: 'app-testcomp2',
  standalone: true,
  imports: [CommonModule, Testcomp2LayoutComponent],
  templateUrl: './testcomp2.component.html',
})
export class Testcomp2Component {
  // 1. Reactive Forms
  reactiveControl = new FormControl('Startwert Reactive');
  reactiveSignal = signal(this.reactiveControl.value || '');

  // 2. Template-driven Forms
  templateValue = signal('Startwert Template-driven');

  // 3. Angular v22 Signal Forms
  signalModel = signal({ textValue: 'Startwert Signal Forms' });
  signalForm = form(this.signalModel);

  constructor() {
    // Wert-Synchronisierung für Reactive Forms ins Signal
    this.reactiveControl.valueChanges.subscribe((val) => {
      this.reactiveSignal.set(val || '');
    });
  }

  // Handler für die Template-driven Wertänderung aus dem Layout
  onTemplateValueChange(newValue: string) {
    this.templateValue.set(newValue);
  }

  // Dein gewünschtes @for-Array, das alle Zustände in Echtzeit bündelt
  inputValuesArray = computed(() => {
    return [
      { type: 'Reactive Form', value: this.reactiveSignal() },
      { type: 'Template-driven Form', value: this.templateValue() },
      { type: 'Signal Form (v22)', value: this.signalModel().textValue },
    ];
  });
}
