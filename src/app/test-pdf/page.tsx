'use client';

import { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function TestPDF() {
  const [surahId, setSurahId] = useState('1');
  const [surahData, setSurahData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const fetchSurahData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/surah?surahId=${surahId}`);
      const data = await response.json();
      setSurahData(data);
    } catch (error) {
      console.error('Error fetching surah data:', error);
      alert('Failed to fetch surah data');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!contentRef.current || !surahData) return;

    setIsGenerating(true);
    try {
      console.log('Starting PDF generation...');
      
      const canvas = await html2canvas(contentRef.current, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true,
      });

      console.log('Canvas created:', canvas.width, 'x', canvas.height);

      const imgData = canvas.toDataURL('image/png');
      console.log('Image data created, length:', imgData.length);

      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      console.log('Image dimensions:', imgWidth, 'x', imgHeight);

      // If image is taller than one page, split it
      if (imgHeight > pageHeight) {
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      } else {
        // Single page
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }

      pdf.save(`surah-${surahId}.pdf`);
      console.log('PDF saved successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test PDF Generator</h1>
      
      <div className="space-y-4 mb-8">
        <div>
          <label className="block mb-2">Surah ID:</label>
          <input
            type="number"
            min="1"
            max="114"
            value={surahId}
            onChange={(e) => setSurahId(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        
        <button
          onClick={fetchSurahData}
          disabled={isLoading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400 mr-2"
        >
          {isLoading ? 'Loading...' : 'Load Surah'}
        </button>

        {surahData && (
          <button
            onClick={generatePDF}
            disabled={isGenerating}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {isGenerating ? 'Generating PDF...' : 'Generate PDF'}
          </button>
        )}
      </div>

      {/* Content to be converted to PDF */}
      {surahData && (
        <div 
          ref={contentRef} 
          style={{
            backgroundColor: '#ffffff',
            padding: '32px',
            maxWidth: '800px',
            margin: '0 auto',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '16px',
            color: '#000000'
          }}>
            {surahData.chapter.name_simple}
          </h1>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            textAlign: 'right',
            marginBottom: '32px',
            color: '#000000'
          }} dir="rtl">
            {surahData.chapter.name_arabic}
          </h2>
          
          <div>
            {surahData.verses.map((verse: any) => (
              <div key={verse.id} style={{
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '16px',
                marginBottom: '24px'
              }}>
                <div style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  marginBottom: '8px'
                }}>
                  [{verse.verse_number}]
                </div>
                <div style={{
                  fontSize: '20px',
                  textAlign: 'right',
                  lineHeight: '1.6',
                  color: '#000000'
                }} dir="rtl">
                  {verse.text_uthmani}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 