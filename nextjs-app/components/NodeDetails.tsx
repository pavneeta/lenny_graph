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
    <div className="absolute top-5 right-5 bg-black/90 backdrop-blur-md p-6 rounded-lg z-10 max-w-md max-h-[80vh] overflow-y-auto">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center text-xl transition"
      >
        ×
      </button>

      <h3 className="text-xl font-bold mb-4 text-blue-400">{episode.episode_name}</h3>
      
      {episode.guest_name && (
        <p className="text-gray-400 mb-4">Guest: {episode.guest_name}</p>
      )}

      <div className="mb-4">
        <a
          href={transcriptFileName}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-blue-400 hover:text-blue-300 border border-blue-400/30 px-3 py-1.5 rounded transition hover:bg-blue-400/10"
        >
          📄 View Raw Transcript
        </a>
      </div>

      {episode.categories.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm uppercase tracking-wide text-white mb-2">Categories</h4>
          <div className="flex flex-wrap gap-2">
            {episode.categories.map((cat, idx) => (
              <span
                key={idx}
                className="inline-block bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs border border-blue-400/30"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}

      {episode.functions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm uppercase tracking-wide text-white mb-2">Functions</h4>
          <div className="flex flex-wrap gap-2">
            {episode.functions.map((func, idx) => (
              <span
                key={idx}
                className="inline-block bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs border border-blue-400/30"
              >
                {func}
              </span>
            ))}
          </div>
        </div>
      )}

      {episode.primary_audience.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm uppercase tracking-wide text-white mb-2">Primary Audience</h4>
          <div className="flex flex-wrap gap-2">
            {episode.primary_audience.map((aud, idx) => (
              <span
                key={idx}
                className="inline-block bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs border border-blue-400/30"
              >
                {aud}
              </span>
            ))}
          </div>
        </div>
      )}

      {episode.key_takeaways.length > 0 && (
        <div>
          <h4 className="text-sm uppercase tracking-wide text-white mb-2">Key Takeaways</h4>
          <div className="space-y-2">
            {episode.key_takeaways.map((takeaway, idx) => (
              <div
                key={idx}
                className="bg-white/5 p-3 rounded border-l-4 border-blue-400 text-sm leading-relaxed"
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

