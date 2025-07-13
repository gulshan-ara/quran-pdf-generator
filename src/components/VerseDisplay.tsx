import { Verse } from "@/types/quran";

interface VerseDisplayProps {
  verse: Verse;
}

export function VerseDisplay({ verse }: VerseDisplayProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <span className="bg-gray-400 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
          {verse.verse_number}
        </span>
        {verse.sajdah_number && (
          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
            Sajdah {verse.sajdah_number}
          </span>
        )}
      </div>
      
      <div className="text-right mb-4">
        <p className="text-3xl text-gray-800 leading-relaxed font-medium">
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
  );
} 