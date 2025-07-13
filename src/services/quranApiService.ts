import { QuranData } from "@/types/quran";

export class QuranApiService {
  static async fetchSurahData(surahId: number): Promise<QuranData> {
    const response = await fetch(`/api/surah?surahId=${surahId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} for Surah ${surahId}`);
    }
    
    return await response.json();
  }

  static async fetchMultipleSurahs(surahIds: number[]): Promise<QuranData[]> {
    const dataPromises = surahIds.map(surahId => this.fetchSurahData(surahId));
    return await Promise.all(dataPromises);
  }
}