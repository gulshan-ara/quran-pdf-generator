"use client";

import { useState } from "react";
import { QuranData } from "@/types/quran";
import { QuranApiService } from "@/services/quranApiService";
import { QuranPDFService } from "@/utils/quranPDFService";
import { CoverPageOptions } from "@/utils/coverPageGenerator";
import { surahList } from "@/utils/surahList";
import { SurahSelector } from "@/components/SurahSelector";
import { ActionButtons } from "@/components/ActionButtons";
import { PreviewModal } from "@/components/PreviewModal";
import { CoverPageOptionsComponent } from "@/components/CoverPageOptions";

export default function Home() {
  /* --- State --- */
  const [selectedSurahs, setSelectedSurahs] = useState<number[]>([1]);
  const [quranDataList, setQuranDataList] = useState<QuranData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [generateLoading, setGenerateLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [coverPageOptions, setCoverPageOptions] = useState<CoverPageOptions>({
    title: "Holy Quran",
    subtitle: "Selected Chapters",
    includeDate: true,
    includeStats: true,
  });

  /* --- Services --- */
  const pdfService = new QuranPDFService();

  /* --- Handlers --- */

  // Toggle select/unselect a surah ID
  const handleSurahSelection = (surahId: number) => {
    setSelectedSurahs((prev) => {
      if (prev.includes(surahId)) {
        return prev.filter((id) => id !== surahId);
      } else {
        return [...prev, surahId].sort((a, b) => a - b);
      }
    });
  };

  // Select all surahs
  const handleSelectAll = () => {
    setSelectedSurahs(surahList.map((surah) => surah.id));
  };

  // Clear all selections
  const handleClearAll = () => {
    setSelectedSurahs([]);
  };

  // Fetch Quran data for the selected surahs
  const fetchQuranData = async (surahIds: number[]) => {
    setLoading(true);
    setError(null);
    try {
      const data = await QuranApiService.fetchMultipleSurahs(surahIds);
      setQuranDataList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch Quran data");
    } finally {
      setLoading(false);
    }
  };

  // Preview PDF: fetch data and show preview modal
  const handlePreviewPDF = async () => {
    if (selectedSurahs.length === 0) {
      setError("Please select at least one surah");
      return;
    }
    setPreviewLoading(true);
    setError(null);
    try {
      await fetchQuranData(selectedSurahs);
      setShowPreview(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Quran data");
    } finally {
      setPreviewLoading(false);
    }
  };

  // Generate and download PDF file
  const handleGeneratePDF = async () => {
    if (selectedSurahs.length === 0) {
      setError("Please select at least one surah");
      return;
    }
    setGenerateLoading(true);
    setError(null);
    try {
      let dataToUse = quranDataList;
      // Fetch Quran data if not already loaded or outdated
      if (dataToUse.length === 0 || dataToUse.length !== selectedSurahs.length) {
        dataToUse = await QuranApiService.fetchMultipleSurahs(selectedSurahs);
        setQuranDataList(dataToUse);
      }
      await pdfService.generatePDF(selectedSurahs, dataToUse, coverPageOptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate PDF");
    } finally {
      setGenerateLoading(false);
    }
  };

  // Close preview modal
  const closePreview = () => {
    setShowPreview(false);
  };

  /* --- Render --- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Quran PDF Generator</h1>
          <p className="text-gray-600">Select multiple surahs to generate or preview their PDF</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column: Surah Selector */}
          <div className="md:col-span-1">
            <SurahSelector
              selectedSurahs={selectedSurahs}
              onSurahSelection={handleSurahSelection}
              onSelectAll={handleSelectAll}
              onClearAll={handleClearAll}
              loading={loading}
            />
          </div>

          {/* Right Column: Cover Page Options and Actions */}
          <div className="md:col-span-2 flex flex-col space-y-6">
            <CoverPageOptionsComponent
              options={coverPageOptions}
              onChange={setCoverPageOptions}
            />

            <ActionButtons
              onPreview={handlePreviewPDF}
              onGenerate={handleGeneratePDF}
              previewLoading={previewLoading}
              generateLoading={generateLoading}
              error={error}
              disabled={selectedSurahs.length === 0}
            />
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        quranDataList={quranDataList}
        showPreview={showPreview}
        onClose={closePreview}
        onGeneratePDF={handleGeneratePDF}
        loading={generateLoading}
        selectedSurahs={selectedSurahs}
        coverPageOptions={coverPageOptions}
      />
    </div>
  );
}