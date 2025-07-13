import { QuranData } from "@/types/quran";
import { PDFGenerator } from "./pdfGenerator";

export class SurahContentGenerator {
  private pdfGenerator: PDFGenerator;

  constructor(pdfGenerator: PDFGenerator) {
    this.pdfGenerator = pdfGenerator;
  }

  async generateSurahHeader(quranData: QuranData): Promise<void> {
    const headerContent = `
      <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px;">
        <h1 style="color: #2563eb; margin: 0 0 10px 0; font-size: 28px;">${quranData.chapter.name_simple}</h1>
        <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px; font-weight: normal;">${quranData.chapter.name_arabic}</h2>
        <p style="color: #6b7280; margin: 0; font-size: 14px;">Chapter ${quranData.chapter.id} • ${quranData.chapter.verses_count} verses</p>
      </div>
    `;
    
    await this.pdfGenerator.renderElement(headerContent, 15);
  }

  async generateBismillah(quranData: QuranData): Promise<void> {
    if (!quranData.chapter.bismillah_pre) return;

    const bismillahContent = `
      <div style="text-align: center; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
        <p style="font-size: 20px; color: #1f2937; margin: 0; font-weight: 500;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
        <p style="font-size: 12px; color: #6b7280; margin: 5px 0 0 0;">In the name of Allah, the Most Gracious, the Most Merciful</p>
      </div>
    `;
    
    await this.pdfGenerator.renderElement(bismillahContent, 15);
  }

  async generateVerse(verse: any): Promise<void> {
    // Keep full Arabic text, only sanitize translations if needed
    const sanitizeTranslation = (text: string): string => {
      if (!text) return '';
      // Only truncate translations if they're extremely long (more than 5000 chars)
      return text.length > 5000 ? text.substring(0, 5000) + '...' : text;
    };

    const arabicText = verse.text_uthmani || '';
    const translations = verse.translations && verse.translations.length > 0 
      ? verse.translations.map((translation: any) => sanitizeTranslation(translation.text || 'Translation not available'))
      : [];

    const verseContent = `
      <div style="margin-bottom: 0; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f3f4f6;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <span style="background-color: #252525; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; text-align: center;">
            ${verse.verse_number}
          </span>
          ${verse.sajdah_number ? `
            <span style="background-color: #10b981; color: white; padding: 5px 10px; border-radius: 20px; font-size: 12px;">
              Sajdah ${verse.sajdah_number}
            </span>
          ` : ''}
          ${verse.ruku_number ? `
            <span style="background-color: #10b981; color: white; padding: 5px 10px; border-radius: 20px; font-size: 12px;">
              Ruku ${verse.ruku_number}
            </span>
          ` : ''}
        </div>
        
        <div style="text-align: right; margin-bottom: 15px;">
          <p style="font-size: 24px; color: #1f2937; margin: 0; line-height: 1.8; font-weight: 500; word-wrap: break-word;">
            ${arabicText}
          </p>
        </div>
        
        ${translations.length > 0 ? `
          <div style="border-top: 1px solid #e5e7eb; padding-top: 15px;">
            ${translations.map((translation: string) => `
              <p style="font-size: 14px; color: #4b5563; margin: 0 0 10px 0; font-style: italic; line-height: 1.6; word-wrap: break-word;">
                ${translation}
              </p>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
    
    try {
      await this.pdfGenerator.renderElement(verseContent, 10);
    } catch (error) {
      console.error(`Error generating verse ${verse.verse_number}:`, error);
             // Fallback to a simpler version if the main one fails
       const fallbackContent = `
         <div style="margin-bottom: 10px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f3f4f6;">
           <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
             <span style="background-color: #252525; color: white; width: 25px; height: 25px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; text-align: center;">
               ${verse.verse_number}
             </span>
           </div>
           <p style="font-size: 18px; color: #1f2937; margin: 0; line-height: 1.6; text-align: right;">
             ${arabicText}
           </p>
         </div>
       `;
      await this.pdfGenerator.renderElement(fallbackContent, 10);
    }
  }

  async generateCompleteSurah(quranData: QuranData): Promise<void> {
    await this.generateSurahHeader(quranData);
    await this.generateBismillah(quranData);
    
    for (const verse of quranData.verses) {
      await this.generateVerse(verse);
    }
  }
}