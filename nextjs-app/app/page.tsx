'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Graph3D from '@/components/Graph3D';
import FilterPanel from '@/components/FilterPanel';
import NodeDetails from '@/components/NodeDetails';
import { loadEpisodesData } from '@/lib/dataLoader';
import { createGraph, filterGraph } from '@/lib/graphUtils';
import { Episode, Node, Edge } from '@/types';

export default function Home() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Episode | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedFunctions, setSelectedFunctions] = useState<Set<string>>(new Set());
  const [selectedAudiences, setSelectedAudiences] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEpisodesData().then((data) => {
      setEpisodes(data);
      const { nodes: initialNodes, edges: initialEdges } = createGraph(data);
      setNodes(initialNodes);
      setEdges(initialEdges);
      setLoading(false);
    });
  }, []);

  // Memoize the full graph to avoid recalculating on every render
  const fullGraph = useMemo(() => {
    if (episodes.length === 0) return { nodes: [], edges: [] };
    return createGraph(episodes);
  }, [episodes]);

  // Memoize filtered graph
  const filteredGraph = useMemo(() => {
    return filterGraph(
      fullGraph.nodes,
      fullGraph.edges,
      selectedCategories,
      selectedFunctions,
      selectedAudiences
    );
  }, [fullGraph, selectedCategories, selectedFunctions, selectedAudiences]);

  useEffect(() => {
    setNodes(filteredGraph.nodes);
    setEdges(filteredGraph.edges);
  }, [filteredGraph]);

  const handleCategoryChange = (category: string, selected: boolean) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (selected) {
        next.add(category);
      } else {
        next.delete(category);
      }
      return next;
    });
  };

  const handleFunctionChange = (func: string, selected: boolean) => {
    setSelectedFunctions(prev => {
      const next = new Set(prev);
      if (selected) {
        next.add(func);
      } else {
        next.delete(func);
      }
      return next;
    });
  };

  const handleAudienceChange = (audience: string, selected: boolean) => {
    setSelectedAudiences(prev => {
      const next = new Set(prev);
      if (selected) {
        next.add(audience);
      } else {
        next.delete(audience);
      }
      return next;
    });
  };

  const handleReset = () => {
    setSelectedCategories(new Set());
    setSelectedFunctions(new Set());
    setSelectedAudiences(new Set());
  };

  const handleNodeClick = useCallback((nodeIndex: number) => {
    // Use the current filtered nodes directly
    if (nodes && nodes[nodeIndex]) {
      setSelectedNode(nodes[nodeIndex].episode);
    }
  }, [nodes]);

  if (loading) {
    return (
      <div className="w-screen h-screen bg-white flex items-center justify-center text-[#ff6b35]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p>Loading episodes...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="w-screen h-screen bg-white relative overflow-hidden">
      <Graph3D
        nodes={nodes}
        edges={edges}
        onNodeClick={handleNodeClick}
        paused={selectedNode !== null}
      />
      
      <FilterPanel
        episodes={episodes}
        selectedCategories={selectedCategories}
        selectedFunctions={selectedFunctions}
        selectedAudiences={selectedAudiences}
        onCategoryChange={handleCategoryChange}
        onFunctionChange={handleFunctionChange}
        onAudienceChange={handleAudienceChange}
        onReset={handleReset}
      />

      <NodeDetails
        episode={selectedNode}
        onClose={() => {
          setSelectedNode(null);
          // Resume animation when details panel closes
        }}
      />

      <div className="absolute bottom-5 left-5 bg-white/95 backdrop-blur-md p-3 rounded text-xs text-[#ff6b35] border border-[#ff6b35]/30 shadow-lg">
        <div className="font-semibold">Episodes: {episodes.length}</div>
        <div className="font-semibold">Visible: {nodes.length}</div>
        <div className="font-semibold">Connections: {edges.length}</div>
      </div>
    </main>
  );
}

