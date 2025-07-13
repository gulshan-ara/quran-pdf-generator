import { surahList } from "@/utils/surahList";

interface SurahSelectorProps {
  selectedSurah: number;
  onSurahChange: (surahId: number) => void;
  loading: boolean;
}

export function SurahSelector({ selectedSurah, onSurahChange, loading }: SurahSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Surah Selection Dropdown */}
      <div>
        <label htmlFor="surah-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Surah
        </label>
        <select
          id="surah-select"
          value={selectedSurah}
          onChange={(e) => onSurahChange(Number(e.target.value))}
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
    </div>
  );
} 