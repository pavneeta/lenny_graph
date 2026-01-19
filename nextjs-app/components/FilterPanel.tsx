'use client';

import { Episode } from '@/types';

interface FilterPanelProps {
  episodes: Episode[];
  selectedCategories: Set<string>;
  selectedFunctions: Set<string>;
  selectedAudiences: Set<string>;
  onCategoryChange: (category: string, selected: boolean) => void;
  onFunctionChange: (func: string, selected: boolean) => void;
  onAudienceChange: (audience: string, selected: boolean) => void;
  onReset: () => void;
}

export default function FilterPanel({
  episodes,
  selectedCategories,
  selectedFunctions,
  selectedAudiences,
  onCategoryChange,
  onFunctionChange,
  onAudienceChange,
  onReset
}: FilterPanelProps) {
  // Collect all unique values
  const allCategories = new Set<string>();
  const allFunctions = new Set<string>();
  const allAudiences = new Set<string>();

  episodes.forEach(ep => {
    ep.categories.forEach(cat => allCategories.add(cat));
    ep.functions.forEach(func => allFunctions.add(func));
    ep.primary_audience.forEach(aud => allAudiences.add(aud));
  });

  return (
    <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-md p-5 rounded-lg z-10 max-w-sm border border-[#ff6b35]/30 shadow-lg">
      <h2 className="text-lg font-semibold mb-4 text-[#ff6b35]">Filter by Dimensions</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#ff6b35] mb-2">Category:</label>
          <select
            multiple
            className="w-full bg-white text-[#1a1a1a] rounded p-2 text-sm max-h-32 overflow-y-auto border border-[#ff6b35]/40"
            size={Math.min(5, allCategories.size)}
            onChange={(e) => {
              const options = Array.from(e.target.selectedOptions, option => option.value);
              allCategories.forEach(cat => {
                onCategoryChange(cat, options.includes(cat));
              });
            }}
            value={Array.from(selectedCategories)}
          >
              {Array.from(allCategories).sort().map(cat => (
                <option key={cat} value={cat} className="bg-white text-[#1a1a1a]">
                  {cat}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#ff6b35] mb-2">Functions:</label>
          <select
            multiple
            className="w-full bg-white text-[#1a1a1a] rounded p-2 text-sm max-h-32 overflow-y-auto border border-[#ff6b35]/40"
            size={Math.min(5, allFunctions.size)}
            onChange={(e) => {
              const options = Array.from(e.target.selectedOptions, option => option.value);
              allFunctions.forEach(func => {
                onFunctionChange(func, options.includes(func));
              });
            }}
            value={Array.from(selectedFunctions)}
          >
              {Array.from(allFunctions).sort().map(func => (
                <option key={func} value={func} className="bg-white text-[#1a1a1a]">
                  {func}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#ff6b35] mb-2">Primary Audience:</label>
          <select
            multiple
            className="w-full bg-white text-[#1a1a1a] rounded p-2 text-sm max-h-32 overflow-y-auto border border-[#ff6b35]/40"
            size={Math.min(5, allAudiences.size)}
            onChange={(e) => {
              const options = Array.from(e.target.selectedOptions, option => option.value);
              allAudiences.forEach(aud => {
                onAudienceChange(aud, options.includes(aud));
              });
            }}
            value={Array.from(selectedAudiences)}
          >
              {Array.from(allAudiences).sort().map(aud => (
                <option key={aud} value={aud} className="bg-white text-[#1a1a1a]">
                  {aud}
                </option>
              ))}
          </select>
        </div>

        <button
          onClick={onReset}
          className="w-full bg-[#ff6b35] hover:bg-[#e55a2b] text-white py-2 px-4 rounded text-sm font-medium transition border border-[#ff6b35]/30 shadow-sm"
        >
          Reset All
        </button>
      </div>
    </div>
  );
}

