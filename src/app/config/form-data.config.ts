export interface Country {
  code: string;
  name: string;
}

export const FORM_DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

export const FORM_MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

export const COUNTRIES: Country[] = [
  { code: 'Deutschland', name: 'Deutschland' },
  { code: 'Österreich', name: 'Österreich' },
  { code: 'Schweiz', name: 'Schweiz' },
];

export const STATES_PER_COUNTRY: Record<string, string[]> = {
  Deutschland: [
    'Baden-Württemberg',
    'Bayern',
    'Berlin',
    'Brandenburg',
    'Bremen',
    'Hamburg',
    'Hessen',
    'Mecklenburg-Vorpommern',
    'Niedersachsen',
    'Nordrhein-Westfalen',
    'Rheinland-Pfalz',
    'Saarland',
    'Sachsen',
    'Sachsen-Anhalt',
    'Schleswig-Holstein',
    'Thüringen',
  ],
  Österreich: [
    'Burgenland',
    'Kärnten',
    'Niederösterreich',
    'Oberösterreich',
    'Salzburg',
    'Steiermark',
    'Tirol',
    'Vorarlberg',
    'Wien',
  ],
  Schweiz: [
    'Aargau',
    'Appenzell Ausserrhoden',
    'Appenzell Innerrhoden',
    'Basel-Landschaft',
    'Basel-Stadt',
    'Bern',
    'Freiburg',
    'Genf',
    'Glarus',
    'Graubünden',
    'Jura',
    'Luzern',
    'Neuenburg',
    'Nidwalden',
    'Obwalden',
    'Schaffhausen',
    'Schwyz',
    'Solothurn',
    'St. Gallen',
    'Thurgau',
    'Tessin',
    'Uri',
    'Waadt',
    'Wallis',
    'Zug',
    'Zürich',
  ],
};
