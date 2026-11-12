// Interface für die JSON-Struktur von Merriam-Webster
export interface MerriamWebsterEntry {
  meta: {
    id: string;
    uuid: string;
    section: string;
    stems: string[];
    offensive: boolean;
  };
  fl: string; // Wortart (noun, verb, adjective, etc.)
  shortdef: string[]; // Array mit Kurzdefinitionen
}
export interface MerriamWebsterThesaurusEntry {
  meta: {
    id: string;
    uuid: string;
    target?: {
      tuuid: string;
      trel: string;
    };
    syns?: string[][]; // Array von Gruppen von Synonymen
    ants?: string[][]; // Array von Gruppen von Antonymen
  };
  fl: string;
  shortdef: string[];
}
export interface WikipediaEntry {
  id: string;
  typeBadge: string;
  description: string;
  link: string;
}
