'use client';

import { Episode } from '@/types';

interface NodeDetailsProps {
  episode: Episode | null;
  onClose: () => void;
}

export default function NodeDetails({ episode, onClose }: NodeDetailsProps) {
  if (!episode) return null;

  const transcriptFileName = `transcripts/${encodeURIComponent(episode.episode_name)}.txt`;

  return (
    <div className="absolute top-5 right-5 bg-[#1a1a1a]/95 backdrop-blur-md p-6 rounded-lg z-10 max-w-md max-h-[80vh] overflow-y-auto border border-[#2a2a2a]">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-[#f5f5f5] hover:bg-[#2a2a2a] rounded-full w-8 h-8 flex items-center justify-center text-xl transition"
      >
        ×
      </button>

      <h3 className="text-xl font-bold mb-4 text-[#0066ff]">{episode.episode_name}</h3>
      
      {episode.guest_name && (
        <p className="text-[#a0a0a0] mb-4">Guest: {episode.guest_name}</p>
      )}

      <div className="mb-4">
        <a
          href={transcriptFileName}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-[#0066ff] hover:text-[#0052cc] border border-[#0066ff]/30 px-3 py-1.5 rounded transition hover:bg-[#0066ff]/10"
        >
          📄 View Raw Transcript
        </a>
      </div>

      {episode.categories.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm uppercase tracking-wide text-[#f5f5f5] mb-2">Categories</h4>
          <div className="flex flex-wrap gap-2">
            {episode.categories.map((cat, idx) => (
              <span
                key={idx}
                className="inline-block bg-[#0066ff]/20 text-[#0066ff] px-3 py-1 rounded-full text-xs border border-[#0066ff]/30"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}

      {episode.functions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm uppercase tracking-wide text-[#f5f5f5] mb-2">Functions</h4>
          <div className="flex flex-wrap gap-2">
            {episode.functions.map((func, idx) => (
              <span
                key={idx}
                className="inline-block bg-[#0066ff]/20 text-[#0066ff] px-3 py-1 rounded-full text-xs border border-[#0066ff]/30"
              >
                {func}
              </span>
            ))}
          </div>
        </div>
      )}

      {episode.primary_audience.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm uppercase tracking-wide text-[#f5f5f5] mb-2">Primary Audience</h4>
          <div className="flex flex-wrap gap-2">
            {episode.primary_audience.map((aud, idx) => (
              <span
                key={idx}
                className="inline-block bg-[#0066ff]/20 text-[#0066ff] px-3 py-1 rounded-full text-xs border border-[#0066ff]/30"
              >
                {aud}
              </span>
            ))}
          </div>
        </div>
      )}

      {episode.key_takeaways.length > 0 && (
        <div>
          <h4 className="text-sm uppercase tracking-wide text-[#f5f5f5] mb-2">Key Takeaways</h4>
          <div className="space-y-2">
            {episode.key_takeaways.map((takeaway, idx) => (
              <div
                key={idx}
                className="bg-[#1f1f1f] p-3 rounded border-l-4 border-[#0066ff] text-sm leading-relaxed text-[#e0e0e0]"
              >
                {takeaway}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

