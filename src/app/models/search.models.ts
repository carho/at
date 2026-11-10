/**
 * Gemeinsames Basis-Interface für alle Einträge der Such-Layout-Familie
 */
export interface BaseSearchEntry {
  id: string;
  typeBadge?: string; // Entspricht 'fl' (z.B. Noun, Verb)
  definitions?: string[];
  synonyms?: string[][];
}
/**
 * Spezifisches Interface für Merriam-Webster Dictionary Ergebnisse
 */
export interface DictionaryEntry extends BaseSearchEntry {
  definitions: string[];
}

/**
 * Spezifisches Interface für Thesaurus / Synonym Ergebnisse
 */
export interface ThesaurusEntry extends BaseSearchEntry {
  synonyms: string[][];
}
