import { CoverPageOptions } from "@/utils/coverPageGenerator";

interface CoverPageOptionsComponentProps {
  options: CoverPageOptions;
  onChange: (options: CoverPageOptions) => void;
}

export function CoverPageOptionsComponent({
  options,
  onChange,
}: CoverPageOptionsComponentProps) {
  const handleChange = (key: keyof CoverPageOptions, value: any) => {
    onChange({
      ...options,
      [key]: value,
    });
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Cover Page Options
      </h3>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={options.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-black text-black"
            placeholder="Enter PDF title"
          />
        </div>
      </div>
    </div>
  );
}
