import { Episode, Node, Edge } from '@/types';

export function createGraph(episodes: Episode[]): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = episodes.map((episode, index) => ({
    id: index,
    episode,
    position: [
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 100
    ] as [number, number, number],
    velocity: [0, 0, 0] as [number, number, number]
  }));

  const edges: Edge[] = [];
  
  // Create edges between episodes that share dimensions
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const node1 = nodes[i];
      const node2 = nodes[j];
      
      let sharedCount = 0;
      
      // Check shared categories
      const sharedCategories = node1.episode.categories.filter(c => 
        node2.episode.categories.includes(c)
      );
      sharedCount += sharedCategories.length;
      
      // Check shared functions
      const sharedFunctions = node1.episode.functions.filter(f => 
        node2.episode.functions.includes(f)
      );
      sharedCount += sharedFunctions.length;
      
      // Check shared audiences
      const sharedAudiences = node1.episode.primary_audience.filter(a => 
        node2.episode.primary_audience.includes(a)
      );
      sharedCount += sharedAudiences.length;
      
      // Create edge if they share at least 2 dimensions
      if (sharedCount >= 2) {
        edges.push({
          source: i,
          target: j,
          strength: sharedCount / 10 // Normalize strength
        });
      }
    }
  }
  
  return { nodes, edges };
}

export function filterGraph(
  nodes: Node[],
  edges: Edge[],
  selectedCategories: Set<string>,
  selectedFunctions: Set<string>,
  selectedAudiences: Set<string>
): { nodes: Node[]; edges: Edge[] } {
  if (selectedCategories.size === 0 && selectedFunctions.size === 0 && selectedAudiences.size === 0) {
    return { nodes, edges };
  }
  
  // Filter nodes based on selected dimensions (AND logic)
  const filteredNodeIndices = new Set<number>();
  
  nodes.forEach((node, index) => {
    const episode = node.episode;
    
    // Check if episode matches all selected dimensions
    const matchesCategory = selectedCategories.size === 0 || 
      episode.categories.some(cat => selectedCategories.has(cat));
    
    const matchesFunction = selectedFunctions.size === 0 || 
      episode.functions.some(func => selectedFunctions.has(func));
    
    const matchesAudience = selectedAudiences.size === 0 || 
      episode.primary_audience.some(aud => selectedAudiences.has(aud));
    
    if (matchesCategory && matchesFunction && matchesAudience) {
      filteredNodeIndices.add(index);
    }
  });
  
  // Create mapping from old index to new index
  const indexMap = new Map<number, number>();
  let newIndex = 0;
  filteredNodeIndices.forEach(oldIndex => {
    indexMap.set(oldIndex, newIndex++);
  });
  
  // Filter nodes
  const filteredNodes = nodes.filter((_, index) => filteredNodeIndices.has(index));
  
  // Filter edges (only keep edges between filtered nodes)
  const filteredEdges = edges
    .filter(edge => 
      filteredNodeIndices.has(edge.source) && filteredNodeIndices.has(edge.target)
    )
    .map(edge => ({
      source: indexMap.get(edge.source)!,
      target: indexMap.get(edge.target)!,
      strength: edge.strength
    }));
  
  return { nodes: filteredNodes, edges: filteredEdges };
}

