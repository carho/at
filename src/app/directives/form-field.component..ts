import { Component, input } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms'; // 🔄 FIX: Korrekte Imports aus dem Core-Forms-Modul

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [ReactiveFormsModule], // 🔄 FIX: Nutzt das standardisierte reaktive Modul
  template: `
    <div class="mb-3">
      <label class="form-label small fw-bold">{{ label() }}</label>
      <input
        [type]="type()"
        class="form-control"
        [class.is-invalid]="submitted() && control().invalid"
        [class.is-valid]="submitted() && control().valid"
        [formControl]="control()"
      />

      @if (submitted() && control().invalid) {
        <div class="invalid-feedback">{{ errorMsg() }}</div>
      }
    </div>
  `,
})
export class FormFieldComponent {
  label = input.required<string>();
  control = input.required<FormControl>(); // 🔄 Typisiert auf FormControl statt 'any'
  submitted = input<boolean>(false);
  errorMsg = input<string>('');
  type = input<string>('text');
}
