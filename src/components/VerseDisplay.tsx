import { Verse } from "@/types/quran";

interface VerseDisplayProps {
  verse: Verse;
}

export function VerseDisplay({ verse }: VerseDisplayProps) {
  // Helper function to clean up nested superscript tags specifically for translations
  const cleanupTranslationText = (text: string) => {
    if (typeof text !== 'string') return text;
    
    // Fix the specific pattern <sup>2<sup> and similar nested issues
    return text
      .replace(/<sup>(\d+)<sup>/g, '<sup>$1</sup>') // Fix <sup>2<sup> to <sup>2</sup>
      .replace(/<sup>([^<]*?)<sup>/g, '<sup>$1</sup>') // Fix any other nested patterns
      .replace(/<\/sup><\/sup>/g, '</sup>') // Remove double closing tags
      .replace(/<sup>\s*<sup>/g, '<sup>') // Remove nested opening tags
      .replace(/<\/sup>\s*<\/sup>/g, '</sup>') // Remove nested closing tags
      .replace(/<sup><sup>/g, '<sup>') // Remove consecutive opening tags
      .replace(/<\/sup><sup>/g, '</sup><sup>'); // Fix closing followed by opening
  };

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
          {verse.translations.map((translation, index) => {
            const cleanedTranslation = cleanupTranslationText(translation.text || 'Translation not available');
            
            return (
              <p 
                key={index} 
                className="text-sm text-gray-600 mb-2 italic leading-relaxed"
                dangerouslySetInnerHTML={{ __html: cleanedTranslation }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}