import { Component, input } from '@angular/core';

@Component({
  selector: 'app-form-field',
  standalone: true,
  template: `
    <div class="form-group">
      <!-- Nutzung des neuen Namens zur Vermeidung von HTML-Konflikten -->
      <label>{{ labelText() }}</label>

      <!-- Hier wird das Input-Feld aus dem Haupttemplate eingesetzt -->
      <ng-content></ng-content>

      <!-- KORREKTUR: Safe-Navigation (?.) hinzugefügt, da Methoden beim Start fehlen -->
      @if ((submitted() || field()?.touched?.()) && !field()?.valid?.()) {
        <div class="error-message">Bitte überprüfe dieses Pflichtfeld.</div>
      }
    </div>
  `,
})
export class FormFieldComponent {
  // Zur Sicherheit 'labelText' statt 'label' nutzen, um HTML-Attributkollisionen zu verhindern
  labelText = input.required<string>();
  field = input.required<any>();
  submitted = input<boolean>(false);
}
