export interface Chapter {
  id: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
}

export interface Verse {
  id: number;
  verse_number: number;
  ruku_number: number;
  sajdah_number: number | null;
  text_uthmani: string;
  translations: any[];
}

export interface QuranData {
  chapter: Chapter;
  verses: Verse[];
} 