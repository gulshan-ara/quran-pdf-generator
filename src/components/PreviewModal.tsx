import { useRef } from "react";
import { VerseDisplay } from "./VerseDisplay";
import { QuranData } from "@/types/quran";
import { CoverPageOptions } from "@/utils/coverPageGenerator";

interface PreviewModalProps {
  quranDataList: QuranData[];
  showPreview: boolean;
  onClose: () => void;
  onGeneratePDF: () => void;
  loading: boolean;
  selectedSurahs: number[];
  coverPageOptions: CoverPageOptions;
}

export function PreviewModal({ 
  quranDataList, 
  showPreview, 
  onClose, 
  onGeneratePDF, 
  loading, 
  selectedSurahs,
  coverPageOptions 
}: PreviewModalProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  if (!showPreview || quranDataList.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            PDF Preview - {quranDataList.length} Surah{quranDataList.length !== 1 ? 's' : ''}
          </h2>
          <button
            onClick={onClose}
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
            {/* Cover Page Preview */}
            <div className="text-center mb-8 border-b-2 border-blue-600 pb-6">
              <h1 className="text-3xl font-bold text-blue-600 mb-2">
                {coverPageOptions.title}
              </h1>
              <h2 className="text-2xl text-gray-800 mb-2">
                {coverPageOptions.subtitle}
              </h2>
            </div>

            {/* Surahs Content */}
            <div className="space-y-8">
              {quranDataList.map((quranData) => (
                <div key={quranData.chapter.id} className="border-b border-gray-200 pb-6">
                  {/* Surah Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {quranData.chapter.name_simple}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Chapter {quranData.chapter.id} • {quranData.chapter.verses_count} verses
                    </p>
                  </div>

                  {/* Bismillah */}
                  {quranData.chapter.bismillah_pre && (
                    <div className="text-center mb-6 p-4 bg-gray-50 rounded-lg">
                      <p className="text-xl text-gray-800 mb-2 font-medium">
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                      </p>
                      <p className="text-sm text-gray-600">
                        In the name of Allah, the Most Gracious, the Most Merciful
                      </p>
                    </div>
                  )}

                  {/* Verses */}
                  <div className="space-y-4">
                    {quranData.verses.map((verse) => (
                      <VerseDisplay key={verse.id} verse={verse} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t p-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onGeneratePDF}
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
  );
} 