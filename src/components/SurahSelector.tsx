import { surahList } from "@/utils/surahList";

interface SurahSelectorProps {
  selectedSurahs: number[];
  onSurahSelection: (surahId: number) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  loading: boolean;
}

export function SurahSelector({ selectedSurahs, onSurahSelection, onSelectAll, onClearAll, loading }: SurahSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Select Surahs</h3>
        <div className="flex gap-2">
          <button
            onClick={onSelectAll}
            disabled={loading}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded transition-colors"
          >
            Select All
          </button>
          <button
            onClick={onClearAll}
            disabled={loading}
            className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white rounded transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Surah List */}
      <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
        <div className="grid grid-cols-1 gap-1 p-2">
          {surahList.map((surah) => (
            <button
              key={surah.id}
              onClick={() => onSurahSelection(surah.id)}
              disabled={loading}
              className={`p-3 text-left rounded-lg transition-colors ${
                selectedSurahs.includes(surah.id)
                  ? 'bg-blue-100 border-blue-300 border'
                  : 'bg-white hover:bg-gray-50 border border-transparent'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900">
                    {surah.id}. {surah.name}
                  </span>
                </div>
                {selectedSurahs.includes(surah.id) && (
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Count */}
      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-sm text-gray-600">Selected Surahs:</p>
        <p className="text-lg font-semibold text-blue-800">
          {selectedSurahs.length} surah{selectedSurahs.length !== 1 ? 's' : ''}
        </p>
        {selectedSurahs.length > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            {selectedSurahs.map(id => surahList.find(s => s.id === id)?.name).join(', ')}
          </p>
        )}
      </div>
    </div>
  );
} 