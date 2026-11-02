import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-form-field',
  standalone: true,
  host: {
    '[class.has-error]': 'showError()', // Setzt die CSS-Klasse reaktiv
  },
  template: `
    <div class="form-group">
      <label>{{ labelText() }}</label>

      <!-- Hier wird das Input-Feld platziert -->
      <ng-content></ng-content>

      <!-- Dynamische Fehlermeldung anzeigen -->
      @if (showError() && errorMessage()) {
        <div
          class="error-message"
          style="color: #dc3545; font-size: 0.85rem; margin-top: 4px; font-weight: 500;"
        >
          {{ errorMessage() }}
        </div>
      }
    </div>
  `,
})
export class FormFieldComponent {
  labelText = input.required<string>();
  field = input.required<any>();
  submitted = input<boolean>(false);

  // 1. Zustand des Feldes ermitteln (Wichtig: field()() ruft den FieldState ab)
  private fieldState = computed(() => {
    const node = this.field();
    return typeof node === 'function' ? node() : null;
  });

  // 2. Bedingung zur Fehleranzeige: Formular abgeschickt ODER Feld berührt
  showError = computed(() => {
    const state = this.fieldState();
    if (!state) return false;

    // KORREKTUR: Zeige den Fehler auch, wenn das Feld verändert wurde (state.dirty())
    // oder das Formular abgeschickt wurde.
    const isInteracted = this.submitted() || state.touched?.() || state.dirty?.();

    return !!isInteracted && !!state.invalid?.();
  });

  // 3. Dynamische Ermittlung des Fehlers aus dem errors()-Signal Array
  errorMessage = computed(() => {
    const state = this.fieldState();
    if (!state || !state.errors) return '';

    const errorsList = state.errors(); // errors() liefert ein Array [{kind: '...', message: '...'}]
    if (!errorsList || errorsList.length === 0) return '';

    const firstError = errorsList[0];

    // Falls im Validator eine Custom-Message hinterlegt wurde, nimm diese
    if (firstError.message) {
      return firstError.message;
    }

    // Zentrale Übersetzung anhand des Fehler-Typs ('kind')
    switch (firstError.kind) {
      case 'required':
        return 'Dieses Feld ist ein Pflichtfeld.';
      case 'email':
        return 'Bitte gib eine gültige E-Mail-Adresse ein.';
      case 'minLength':
        return 'Die Eingabe ist zu kurz.';
      case 'zipCodeDe':
      case 'zipCodeAt':
      case 'birthdayInvalid':
      case 'birthdayFuture':
        return firstError.message; // Gibt den exakten Text aus der Validator-Datei zurück

      default:
        return 'Bitte überprüfe die Eingabe in diesem Feld.';
    }
  });
}
