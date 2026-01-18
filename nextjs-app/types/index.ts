export interface Episode {
  episode_name: string;
  guest_name: string;
  key_takeaways: string[];
  categories: string[];
  functions: string[];
  primary_audience: string[];
  file_path?: string;
}

export interface Node {
  id: number;
  episode: Episode;
  position: [number, number, number];
  velocity: [number, number, number];
}

export interface Edge {
  source: number;
  target: number;
  strength: number;
}

export interface FilterState {
  categories: Set<string>;
  functions: Set<string>;
  audiences: Set<string>;
}

