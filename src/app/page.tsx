"use client";

import { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { surahList } from "@/utils/surahList";

interface Chapter {
  id: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
}

interface Verse {
  id: number;
  verse_number: number;
  ruku_number: number;
  sajdah_number: number | null;
  text_uthmani: string;
  translations: any[];
}

interface QuranData {
  chapter: Chapter;
  verses: Verse[];
}

export default function Home() {
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [quranData, setQuranData] = useState<QuranData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const fetchQuranData = async (surahId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/surah?surahId=${surahId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: QuranData = await response.json();
      setQuranData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Quran data');
      console.error('Error fetching Quran data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewPDF = async () => {
    await fetchQuranData(selectedSurah);
    setShowPreview(true);
  };

  const handleGeneratePDF = async () => {
    if (!quranData) {
      await fetchQuranData(selectedSurah);
    }
    
    if (!quranData) {
      setError('Failed to load Quran data');
      return;
    }
  
    setLoading(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (2 * margin);
      const maxContentHeight = pageHeight - (2 * margin);
      
      let currentY = margin;
      let isFirstPage = true;
      
      // Helper function to add a new page
      const addNewPage = () => {
        pdf.addPage();
        currentY = margin;
        isFirstPage = false;
      };
      
      // Helper function to render individual elements
      const renderElement = async (htmlContent: string, addSpacing: number = 10) => {
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.width = `${contentWidth * 3.78}px`; // Convert mm to px
        tempDiv.style.backgroundColor = 'white';
        tempDiv.style.padding = '0';
        tempDiv.style.fontFamily = 'Arial, sans-serif';
        
        tempDiv.innerHTML = htmlContent;
        document.body.appendChild(tempDiv);
        
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });
        
        document.body.removeChild(tempDiv);
        
        const imgData = canvas.toDataURL('image/png');
        const elementHeight = (canvas.height * contentWidth) / canvas.width;
        
        // Check if element fits on current page
        if ((currentY + elementHeight) > (pageHeight - margin)) {
          addNewPage();
        }
        
        pdf.addImage(imgData, 'PNG', margin, currentY, contentWidth, elementHeight);
        currentY += elementHeight + addSpacing;
      };
      
      // Add header
      await renderElement(`
        <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px;">
          <h1 style="color: #2563eb; margin: 0 0 10px 0; font-size: 28px;">${quranData.chapter.name_simple}</h1>
          <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px; font-weight: normal;">${quranData.chapter.name_arabic}</h2>
          <p style="color: #6b7280; margin: 0; font-size: 14px;">Chapter ${quranData.chapter.id} • ${quranData.chapter.verses_count} verses</p>
        </div>
      `, 15);
      
      // Add Bismillah if needed
      if (quranData.chapter.bismillah_pre) {
        await renderElement(`
          <div style="text-align: center; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
            <p style="font-size: 20px; color: #1f2937; margin: 0; font-weight: 500;">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
            <p style="font-size: 12px; color: #6b7280; margin: 5px 0 0 0;">In the name of Allah, the Most Gracious, the Most Merciful</p>
          </div>
        `, 15);
      }
      
      // Add verses one by one
      for (const verse of quranData.verses) {
        await renderElement(`
          <div style="margin-bottom: 0; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #fafafa;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
              <span style="background-color: #2563eb; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">
                ${verse.verse_number}
              </span>
              ${verse.sajdah_number ? `
                <span style="background-color: #10b981; color: white; padding: 5px 10px; border-radius: 20px; font-size: 12px;">
                  Sajdah ${verse.sajdah_number}
                </span>
              ` : ''}
            </div>
            
            <div style="text-align: right; margin-bottom: 15px;">
              <p style="font-size: 24px; color: #1f2937; margin: 0; line-height: 1.8; font-weight: 500;">
                ${verse.text_uthmani}
              </p>
            </div>
            
            ${verse.translations && verse.translations.length > 0 ? `
              <div style="border-top: 1px solid #e5e7eb; padding-top: 15px;">
                ${verse.translations.map(translation => `
                  <p style="font-size: 14px; color: #4b5563; margin: 0 0 10px 0; font-style: italic; line-height: 1.6;">
                    ${translation.text || 'Translation not available'}
                  </p>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `, 10);
      }
      
      // Add footer
      const footerY = pageHeight - margin - 10;
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128);
      pdf.text('Generated by Quran PDF Generator', pageWidth / 2, footerY, { align: 'center' });
      pdf.text(`quran.com API • ${new Date().toLocaleDateString()}`, pageWidth / 2, footerY + 5, { align: 'center' });
      
      // Save the PDF
      const surahName = surahList.find(s => s.id === selectedSurah)?.name || `Surah ${selectedSurah}`;
      pdf.save(`${surahName.replace(/\s+/g, '_')}.pdf`);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
      console.error('Error generating PDF:', err);
    } finally {
      setLoading(false);
    }
  };

  const closePreview = () => {
    setShowPreview(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Quran PDF Generator
          </h1>
          <p className="text-gray-600">
            Select a surah to generate or preview its PDF
          </p>
        </div>

        <div className="space-y-6">
          {/* Surah Selection Dropdown */}
          <div>
            <label htmlFor="surah-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select Surah
            </label>
            <select
              id="surah-select"
              value={selectedSurah}
              onChange={(e) => setSelectedSurah(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
              disabled={loading}
            >
              {surahList.map((surah) => (
                <option key={surah.id} value={surah.id}>
                  {surah.id}. {surah.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Surah Display */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Selected Surah:</p>
            <p className="text-lg font-semibold text-blue-800">
              {surahList.find(s => s.id === selectedSurah)?.name}
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handlePreviewPDF}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Loading...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview PDF
                </>
              )}
            </button>
            
            <button
              onClick={handleGeneratePDF}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && quranData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                PDF Preview - {quranData.chapter.name_simple}
              </h2>
              <button
                onClick={closePreview}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 120px)' }}>
              <div ref={previewRef} className="bg-white max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 border-b-2 border-blue-600 pb-6">
                  <h1 className="text-3xl font-bold text-blue-600 mb-2">
                    {quranData.chapter.name_simple}
                  </h1>
                  <h2 className="text-2xl text-gray-800 mb-2">
                    {quranData.chapter.name_arabic}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Chapter {quranData.chapter.id} • {quranData.chapter.verses_count} verses
                  </p>
                </div>

                {/* Bismillah */}
                {quranData.chapter.bismillah_pre && (
                  <div className="text-center mb-8 p-6 bg-gray-50 rounded-lg">
                    <p className="text-xl text-gray-800 mb-2 font-medium">
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                    <p className="text-sm text-gray-600">
                      In the name of Allah, the Most Gracious, the Most Merciful
                    </p>
                  </div>
                )}

                {/* Verses */}
                <div className="space-y-6">
                  {quranData.verses.map((verse) => (
                    <div key={verse.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                      <div className="flex justify-between items-center mb-4">
                        <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                          {verse.verse_number}
                        </span>
                        {verse.sajdah_number && (
                          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                            Sajdah {verse.sajdah_number}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-right mb-4">
                        <p className="text-2xl text-gray-800 leading-relaxed font-medium">
                          {verse.text_uthmani}
                        </p>
                      </div>
                      
                      {verse.translations && verse.translations.length > 0 && (
                        <div className="border-t border-gray-300 pt-4">
                          {verse.translations.map((translation, index) => (
                            <p key={index} className="text-sm text-gray-600 mb-2 italic leading-relaxed">
                              {translation.text || 'Translation not available'}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="text-center mt-8 pt-6 border-t-2 border-blue-600 text-gray-600 text-sm">
                  <p>Generated by Quran PDF Generator</p>
                  <p className="mt-1">quran.com API • {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t p-6 flex justify-end space-x-4">
              <button
                onClick={closePreview}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleGeneratePDF}
                disabled={loading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}