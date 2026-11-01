import { Component, input } from '@angular/core';

@Component({
  selector: 'app-form-field',
  standalone: true,
  template: `
    <div class="form-group">
      <label>{{ label() }}</label>

      <!-- Hier wird das Input-Feld aus dem Haupttemplate eingesetzt -->
      <ng-content></ng-content>

      <!-- Zentrale Fehlerbehandlung für alle Felder -->
      @if ((submitted() || field().touched()) && !field().valid()) {
        <div class="error-message">Bitte überprüfe dieses Pflichtfeld.</div>
      }
    </div>
  `,
})
export class FormFieldComponent {
  label = input.required<string>();
  field = input.required<any>(); // Nimmt z.B. addressForm.firstName entgegen
  submitted = input<boolean>(false);
}
