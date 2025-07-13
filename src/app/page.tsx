"use client";

import { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { surahList } from "@/utils/surahList";
import { SurahSelector } from "@/components/SurahSelector";
import { ActionButtons } from "@/components/ActionButtons";
import { PreviewModal } from "@/components/PreviewModal";
import { QuranData } from "@/types/quran";

export default function Home() {
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [quranData, setQuranData] = useState<QuranData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [generateLoading, setGenerateLoading] = useState<boolean>(false);
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
    setPreviewLoading(true);
    setError(null);
    
    try {
      await fetchQuranData(selectedSurah);
      setShowPreview(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Quran data');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    setGenerateLoading(true);
    setError(null);
    
    try {
      if (!quranData) {
        await fetchQuranData(selectedSurah);
      }
      
      if (!quranData) {
        setError('Failed to load Quran data');
        return;
      }
    
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
      setGenerateLoading(false);
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
          <SurahSelector 
            selectedSurah={selectedSurah}
            onSurahChange={setSelectedSurah}
            loading={loading}
          />
          
          <ActionButtons 
            onPreview={handlePreviewPDF}
            onGenerate={handleGeneratePDF}
            previewLoading={previewLoading}
            generateLoading={generateLoading}
            error={error}
          />
        </div>
      </div>

      <PreviewModal 
        quranData={quranData}
        showPreview={showPreview}
        onClose={closePreview}
        onGeneratePDF={handleGeneratePDF}
        loading={generateLoading}
      />
    </div>
  );
}