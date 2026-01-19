import { Episode } from '@/types';

export async function loadEpisodesData(): Promise<Episode[]> {
  try {
    const response = await fetch('/Final_lenny_extracted_cleaned.jsonl');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    const lines = text.trim().split('\n');
    
    const episodes = lines
      .map((line, index) => {
        try {
          const episode = JSON.parse(line);
          
          // Extract insights from key_takeaways array
          const insights = (episode.key_takeaways || []).map((t: any) => t.insight || t);
          
          // Extract categories from key_takeaways
          const categories = [
            ...new Set(
              (episode.key_takeaways || [])
                .map((t: any) => t.category)
                .filter((c: any) => c)
                .map((c: string) => c.charAt(0).toUpperCase() + c.slice(1))
            )
          ];
          
          // Extract functions
          let functions: string[] = [];
          if (episode.metadata_tags?.functions) {
            functions = episode.metadata_tags.functions;
          }
          if (episode.functions) {
            functions = [...new Set([...functions, ...episode.functions])];
          }
          functions = functions.map((f: string) => 
            f.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
          );
          
          // Extract primary_audience
          let primary_audience: string[] = [];
          if (episode.metadata_tags?.primary_audience) {
            primary_audience = episode.metadata_tags.primary_audience;
          }
          if (episode.primary_audience) {
            primary_audience = [...new Set([...primary_audience, ...episode.primary_audience])];
          }
          primary_audience = primary_audience.map((a: string) => 
            a.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
          );
          
          return {
            episode_name: episode.host_name || 'Unknown',
            guest_name: episode.host_name || 'Unknown',
            key_takeaways: insights.slice(0, 5),
            categories,
            functions,
            primary_audience,
            file_path: episode.file_path || ''
          };
        } catch (e) {
          console.error(`Error parsing line ${index + 1}:`, e);
          return null;
        }
      })
      .filter((ep) => ep !== null) as Episode[];
    
    return episodes;
  } catch (error) {
    console.error('Error loading episodes data:', error);
    return [];
  }
}

