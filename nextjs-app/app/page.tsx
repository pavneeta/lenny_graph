'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (episodes.length === 0) return;
    
    const { nodes: initialNodes, edges: initialEdges } = createGraph(episodes);
    const { nodes: filteredNodes, edges: filteredEdges } = filterGraph(
      initialNodes,
      initialEdges,
      selectedCategories,
      selectedFunctions,
      selectedAudiences
    );
    
    setNodes(filteredNodes);
    setEdges(filteredEdges);
  }, [episodes, selectedCategories, selectedFunctions, selectedAudiences]);

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

  const handleNodeClick = (nodeIndex: number) => {
    const filteredEpisodes = filterGraph(
      createGraph(episodes).nodes,
      createGraph(episodes).edges,
      selectedCategories,
      selectedFunctions,
      selectedAudiences
    ).nodes;
    
    if (filteredEpisodes[nodeIndex]) {
      setSelectedNode(filteredEpisodes[nodeIndex].episode);
    }
  };

  if (loading) {
    return (
      <div className="w-screen h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p>Loading episodes...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="w-screen h-screen bg-[#0a0a0a] relative overflow-hidden">
      <Graph3D
        nodes={nodes}
        edges={edges}
        onNodeClick={handleNodeClick}
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
        onClose={() => setSelectedNode(null)}
      />

      <div className="absolute bottom-5 left-5 bg-black/80 backdrop-blur-md p-3 rounded text-xs text-gray-400">
        <div>Episodes: {episodes.length}</div>
        <div>Visible: {nodes.length}</div>
        <div>Connections: {edges.length}</div>
      </div>
    </main>
  );
}

