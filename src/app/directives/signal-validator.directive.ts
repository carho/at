import { Directive, ElementRef, inject, input, effect, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appSignalValid]',
  standalone: true,
})
export class SignalValidatorDirective {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  // Akzeptiert das Validierungs-Ergebnis (true/false) als Signal-Input
  isValid = input.required<boolean>({ alias: 'appSignalValid' });

  // Optionale Fehlermeldung, die dynamisch erzeugt wird
  errorMessage = input<string>('');

  private errorSpan: HTMLElement | null = null;

  constructor() {
    // Der Effect reagiert vollautomatisch auf jede Änderung der Input-Signals
    effect(() => {
      const valid = this.isValid();
      const message = this.errorMessage();
      const inputEl = this.el.nativeElement;

      if (!valid && message) {
        // CSS-Klasse für Bootstrap-Fehlerstyling hinzufügen
        this.renderer.addClass(inputEl, 'is-invalid');
        this.showError(message);
      } else {
        // Fehler entfernen, wenn das Feld valide ist
        this.renderer.removeClass(inputEl, 'is-invalid');
        this.removeError();
      }
    });
  }

  private showError(message: string): void {
    const parent = this.el.nativeElement.parentNode;

    if (!this.errorSpan) {
      this.errorSpan = this.renderer.createElement('div');
      this.renderer.addClass(this.errorSpan, 'invalid-feedback');
      this.renderer.appendChild(parent, this.errorSpan);
    }

    if (this.errorSpan) {
      this.errorSpan.textContent = message;
    }
  }

  private removeError(): void {
    if (this.errorSpan) {
      this.renderer.removeChild(this.el.nativeElement.parentNode, this.errorSpan);
      this.errorSpan = null;
    }
  }
}
