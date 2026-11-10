import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-testcomp2-layout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, FormField],
  templateUrl: './testcomp2-layout.component.html',
})
export class Testcomp2LayoutComponent {
  // Inputs für die Formular-Anbindungen aus der Elternkomponente
  reactiveControl = input.required<FormControl>();

  // Template-driven benötigt ein zweiseitiges Binding via Model
  templateValue = input.required<string>();
  templateValueChange = output<string>();

  // Signal Forms Bindung (v22)
  signalFormField = input.required<any>();

  // Das von dir für den Test benötigte Array für die rechte Seite
  displayArray = input.required<{ type: string; value: string }[]>();
}
