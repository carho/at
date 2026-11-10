export interface BaseSearchEntry {
  id: string;
  typeBadge?: string;
  definitions?: string[];
  synonyms?: string[][];
}

export interface DictionaryEntry extends BaseSearchEntry {
  definitions: string[];
}

export interface ThesaurusEntry extends BaseSearchEntry {
  synonyms: string[][];
}

/**
 * Spezifisches Interface für Wikipedia-Suchergebnisse
 */
export interface WikipediaEntry extends BaseSearchEntry {
  description: string;
  link: string;
}

/** Bündelt alle möglichen API-Ergebnisse für dein zentrales Layout */
export type SearchResultEntry = DictionaryEntry | ThesaurusEntry | WikipediaEntry;
