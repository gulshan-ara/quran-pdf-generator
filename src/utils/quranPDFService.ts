import jsPDF from "jspdf";
import { QuranData } from "@/types/quran";
import { surahList } from "@/utils/surahList";
import { PDFGenerator } from "./pdfGenerator";
import { CoverPageGenerator, CoverPageOptions } from "./coverPageGenerator";
import { SurahContentGenerator } from "./surahContentGenerator";

export class QuranPDFService {
  async generatePDF(
    selectedSurahs: number[],
    quranDataList: QuranData[],
    coverPageOptions: CoverPageOptions
  ): Promise<void> {
    if (selectedSurahs.length === 0) {
      throw new Error("Please select at least one surah");
    }

    if (quranDataList.length === 0) {
      throw new Error("Failed to load Quran data");
    }

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfGenerator = new PDFGenerator(pdf);
    const coverGenerator = new CoverPageGenerator(pdf);
    const contentGenerator = new SurahContentGenerator(pdfGenerator);

    try {
      // Generate cover page
      await coverGenerator.generate(
        selectedSurahs,
        quranDataList,
        coverPageOptions
      );

      // Process each surah
      for (let i = 0; i < quranDataList.length; i++) {
        const quranData = quranDataList[i];

        // Start new page for each surah
        pdfGenerator.addNewPage();

        // Generate surah content
        await contentGenerator.generateCompleteSurah(quranData);
      }

      // Add footer
      pdfGenerator.addFooter();

      // Save the PDF
      const fileName = this.generateFileName(selectedSurahs);
      pdfGenerator.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  }

  private generateFileName(selectedSurahs: number[]): string {
    if (selectedSurahs.length === 1) {
      const surahName =
        surahList.find((s) => s.id === selectedSurahs[0])?.name ||
        `Surah_${selectedSurahs[0]}`;
      return `${surahName}.pdf`;
    }
    return `Quran_Chapters_${selectedSurahs.length}_Selected.pdf`;
  }
}
