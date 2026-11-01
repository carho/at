import { SchemaPath, validate } from '@angular/forms/signals';

/**
 * Ein einfacher, wiederverwendbarer Validator für deutsche Postleitzahlen (exakt 5 Ziffern).
 */
export function germanZipCode(field: SchemaPath<string>) {
  return validate(field, ({ value }) => {
    const plzRegex = /^\d{5}$/;

    if (value() && !plzRegex.test(value())) {
      return {
        kind: 'zipCode',
        message: 'Die Postleitzahl muss genau 5 Ziffern lang sein.',
      };
    }

    return null;
  });
}

/**
 * Ein feldübergreifender Validator (Cross-Field), der das ausgewählte Land berücksichtigt.
 * KORREKTUR: Wir nutzen `valueOf`, um den Wert des Nachbarfeldes auszulesen.
 */
export function countryDependentZipCode(
  zipField: SchemaPath<string>,
  countryField: SchemaPath<string>,
) {
  // `valueOf` wird aus dem Parameter-Objekt destrukturiert
  return validate(zipField, ({ value, valueOf }) => {
    const currentZip = value();

    // KORREKTUR: Liest den aktuellen Wert des Typs string aus dem countryField reaktiv aus
    const currentCountry = valueOf(countryField);

    if (!currentZip) return null;

    // Validierung für Deutschland
    if (currentCountry?.toLowerCase() === 'deutschland' || currentCountry?.toLowerCase() === 'de') {
      const dePlzRegex = /^\d{5}$/;
      if (!dePlzRegex.test(currentZip)) {
        return {
          kind: 'zipCodeDe',
          message: 'Für Deutschland muss die Postleitzahl genau 5 Ziffern lang sein.',
        };
      }
    }

    // Validierung für Österreich
    if (currentCountry?.toLowerCase() === 'österreich' || currentCountry?.toLowerCase() === 'at') {
      const atPlzRegex = /^\d{4}$/;
      if (!atPlzRegex.test(currentZip)) {
        return {
          kind: 'zipCodeAt',
          message: 'Für Österreich muss die Postleitzahl genau 4 Ziffern lang sein.',
        };
      }
    }

    return null;
  });
}
