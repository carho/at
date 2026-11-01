import { SchemaPath, validate } from '@angular/forms/signals';

/**
 * Validiert ein Geburtsdatum im Format YYYY-MM-DD.
 * Berücksichtigt auch den Zustand, ob das Geburtsjahr ausgeblendet ist.
 *
 * @param birthdayField Der Schema-Pfad des Datums-Feldes
 * @param hideYearField Der Schema-Pfad der Checkbox (hideYear)
 */
export function validBirthday(
  birthdayField: SchemaPath<string>,
  hideYearField: SchemaPath<boolean>,
) {
  return validate(birthdayField, ({ value, valueOf }) => {
    const dateStr = value();
    const isYearHidden = valueOf(hideYearField);

    if (!dateStr) return null; // 'required' falls es ein Pflichtfeld sein soll

    // Datum parsen (Format: YYYY-MM-DD)
    const parts = dateStr.split('-');
    if (parts.length !== 3) {
      return { kind: 'birthdayInvalid', message: 'Ungültiges Datumsformat.' };
    }

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JS Monate sind 0-basiert
    const day = parseInt(parts[2], 10);

    const parsedDate = new Date(year, month, day);

    // 1. Prüfung: Existiert dieses Datum im Kalender? (z.B. 31.11. wird von JS zu 01.12. geshiftet)
    if (
      parsedDate.getFullYear() !== year ||
      parsedDate.getMonth() !== month ||
      parsedDate.getDate() !== day
    ) {
      return {
        kind: 'birthdayInvalid',
        message: 'Dieses Datum existiert im Kalender nicht (z.B. 30. Februar).',
      };
    }

    // 2. Prüfung: Liegt das Datum in der Zukunft? (Nur prüfen, wenn das echte Jahr aktiv ist)
    if (!isYearHidden) {
      const today = new Date();
      // Uhrzeit nullen für reinen Datumsvergleich
      today.setHours(0, 0, 0, 0);

      if (parsedDate > today) {
        return {
          kind: 'birthdayFuture',
          message: 'Das Geburtsdatum darf nicht in der Zukunft liegen.',
        };
      }
    }

    return null; // Alles valide
  });
}
