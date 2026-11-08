import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-api-error',
  standalone: true,
  templateUrl: './api-error.component.html',
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
    `,
  ],
})
export class ApiErrorComponent {
  // KLASSISCHES INPUT: Erzwingt, dass Werte als reine Strings verarbeitet werden
  @Input({ required: true }) errorTitle!: string;
  @Input({ required: true }) message!: string;

  @Output() retry = new EventEmitter<void>();
  constructor() {
console.log('[Lifecycle] Komponente für Fehler')  }
  ngOnInit() {
    // Richtig: Loggt, sobald die Komponente startbereit und die Variable verfügbar ist
    // Bei Signals rufst du die Variable wie eine Funktion auf: ()
    console.log(
      `[Lifecycle] Komponente für Fehler "${this.message}" , "${this.errorTitle}" wurde initialisiert.`,
    );
  }
  protected onRetry() {
    this.retry.emit();
  }
}
