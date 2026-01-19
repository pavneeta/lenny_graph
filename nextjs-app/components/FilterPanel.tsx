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
    <div className="absolute top-5 left-5 bg-[#1a1a1a]/90 backdrop-blur-md p-5 rounded-lg z-10 max-w-sm border border-[#2a2a2a]">
      <h2 className="text-lg font-semibold mb-4 text-[#f5f5f5]">Filter by Dimensions</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#d1d1d1] mb-2">Category:</label>
          <select
            multiple
            className="w-full bg-[#1f1f1f] text-[#f5f5f5] rounded p-2 text-sm max-h-32 overflow-y-auto border border-[#2a2a2a]"
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
                <option key={cat} value={cat} className="bg-[#1f1f1f]">
                  {cat}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#d1d1d1] mb-2">Functions:</label>
          <select
            multiple
            className="w-full bg-[#1f1f1f] text-[#f5f5f5] rounded p-2 text-sm max-h-32 overflow-y-auto border border-[#2a2a2a]"
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
                <option key={func} value={func} className="bg-[#1f1f1f]">
                  {func}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#d1d1d1] mb-2">Primary Audience:</label>
          <select
            multiple
            className="w-full bg-[#1f1f1f] text-[#f5f5f5] rounded p-2 text-sm max-h-32 overflow-y-auto border border-[#2a2a2a]"
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
                <option key={aud} value={aud} className="bg-[#1f1f1f]">
                  {aud}
                </option>
              ))}
          </select>
        </div>

        <button
          onClick={onReset}
          className="w-full bg-[#0066ff] hover:bg-[#0052cc] text-white py-2 px-4 rounded text-sm font-medium transition border border-[#0066ff]/30"
        >
          Reset All
        </button>
      </div>
    </div>
  );
}

