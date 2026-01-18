'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Node, Edge } from '@/types';

interface Graph3DProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick?: (nodeIndex: number) => void;
}

export default function Graph3D({ nodes, edges, onNodeClick }: Graph3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any>(null);
  const nodeMeshesRef = useRef<THREE.Mesh[]>([]);
  const edgeLinesRef = useRef<THREE.Line[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const nodesRef = useRef<Node[]>(nodes);
  const edgesRef = useRef<Edge[]>(edges);

  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [nodes, edges]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
    camera.position.set(0, 0, 150);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Load OrbitControls dynamically
    import('three/examples/jsm/controls/OrbitControls.js').then((module) => {
      const OrbitControls = module.OrbitControls;
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controlsRef.current = controls;
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    scene.add(directionalLight);

    // Create graph
    const createGraph = () => {
      // Clear existing meshes
      nodeMeshesRef.current.forEach(mesh => scene.remove(mesh));
      edgeLinesRef.current.forEach(line => scene.remove(line));
      nodeMeshesRef.current = [];
      edgeLinesRef.current = [];

      const currentNodes = nodesRef.current;
      const currentEdges = edgesRef.current;
      const nodeColor = 0x4a9eff;

      // Create nodes
      currentNodes.forEach((node, index) => {
        const geometry = new THREE.SphereGeometry(3.0, 16, 16);
        const material = new THREE.MeshPhongMaterial({
          color: nodeColor,
          emissive: nodeColor,
          emissiveIntensity: 0.4,
          shininess: 100
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...node.position);
        mesh.userData = { nodeIndex: index };
        
        // Add glow
        const glowGeometry = new THREE.SphereGeometry(3.5, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: nodeColor,
          transparent: true,
          opacity: 0.4
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        mesh.add(glow);
        
        scene.add(mesh);
        nodeMeshesRef.current.push(mesh);
      });

      // Create edges
      currentEdges.forEach(edge => {
        const source = currentNodes[edge.source];
        const target = currentNodes[edge.target];
        
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(...source.position),
          new THREE.Vector3(...target.position)
        ]);
        
        const material = new THREE.LineBasicMaterial({
          color: nodeColor,
          transparent: true,
          opacity: 0.3
        });
        
        const line = new THREE.Line(geometry, material);
        scene.add(line);
        edgeLinesRef.current.push(line);
      });
    };

    // Click detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshesRef.current);

      if (intersects.length > 0 && onNodeClick) {
        const clickedMesh = intersects[0].object as THREE.Mesh;
        const nodeIndex = clickedMesh.userData.nodeIndex;
        onNodeClick(nodeIndex);
      }
    };

    containerRef.current.addEventListener('click', handleClick);

    // Force-directed layout
    const updateLayout = () => {
      const currentNodes = nodesRef.current;
      const currentEdges = edgesRef.current;
      
      const repulsionStrength = 0.1;
      const attractionStrength = 0.01;
      const damping = 0.9;

      // Repulsion between all nodes
      for (let i = 0; i < currentNodes.length; i++) {
        for (let j = i + 1; j < currentNodes.length; j++) {
          const node1 = currentNodes[i];
          const node2 = currentNodes[j];
          const diff = [
            node1.position[0] - node2.position[0],
            node1.position[1] - node2.position[1],
            node1.position[2] - node2.position[2]
          ];
          const distance = Math.sqrt(diff[0] ** 2 + diff[1] ** 2 + diff[2] ** 2) || 0.1;
          const force = repulsionStrength / (distance ** 2);
          
          const forceX = (diff[0] / distance) * force;
          const forceY = (diff[1] / distance) * force;
          const forceZ = (diff[2] / distance) * force;
          
          node1.velocity[0] += forceX;
          node1.velocity[1] += forceY;
          node1.velocity[2] += forceZ;
          node2.velocity[0] -= forceX;
          node2.velocity[1] -= forceY;
          node2.velocity[2] -= forceZ;
        }
      }

      // Attraction along edges
      currentEdges.forEach(edge => {
        const source = currentNodes[edge.source];
        const target = currentNodes[edge.target];
        const diff = [
          target.position[0] - source.position[0],
          target.position[1] - source.position[1],
          target.position[2] - source.position[2]
        ];
        const distance = Math.sqrt(diff[0] ** 2 + diff[1] ** 2 + diff[2] ** 2) || 0.1;
        const force = attractionStrength * distance * edge.strength;
        
        const forceX = (diff[0] / distance) * force;
        const forceY = (diff[1] / distance) * force;
        const forceZ = (diff[2] / distance) * force;
        
        source.velocity[0] += forceX;
        source.velocity[1] += forceY;
        source.velocity[2] += forceZ;
        target.velocity[0] -= forceX;
        target.velocity[1] -= forceY;
        target.velocity[2] -= forceZ;
      });

      // Update positions
      currentNodes.forEach((node, index) => {
        node.velocity[0] *= damping;
        node.velocity[1] *= damping;
        node.velocity[2] *= damping;
        
        node.position[0] += node.velocity[0];
        node.position[1] += node.velocity[1];
        node.position[2] += node.velocity[2];
        
        // Keep nodes within bounds
        node.position[0] = Math.max(-100, Math.min(100, node.position[0]));
        node.position[1] = Math.max(-100, Math.min(100, node.position[1]));
        node.position[2] = Math.max(-50, Math.min(50, node.position[2]));
        
        // Update mesh position
        if (nodeMeshesRef.current[index]) {
          nodeMeshesRef.current[index].position.set(...node.position);
        }
      });

      // Update edge lines
      currentEdges.forEach((edge, index) => {
        if (edgeLinesRef.current[index]) {
          const source = currentNodes[edge.source];
          const target = currentNodes[edge.target];
          const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(...source.position),
            new THREE.Vector3(...target.position)
          ]);
          edgeLinesRef.current[index].geometry.dispose();
          edgeLinesRef.current[index].geometry = geometry;
        }
      });
    };

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      updateLayout();
      renderer.render(scene, camera);
    };

    createGraph();
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeEventListener('click', handleClick);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      nodeMeshesRef.current.forEach(mesh => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
        scene.remove(mesh);
      });
      
      edgeLinesRef.current.forEach(line => {
        line.geometry.dispose();
        line.material.dispose();
        scene.remove(line);
      });
      
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Update graph when nodes/edges change
  useEffect(() => {
    if (!sceneRef.current) return;
    
    const scene = sceneRef.current;
    const currentNodes = nodesRef.current;
    const currentEdges = edgesRef.current;
    const nodeColor = 0x4a9eff;

    // Clear existing
    nodeMeshesRef.current.forEach(mesh => scene.remove(mesh));
    edgeLinesRef.current.forEach(line => scene.remove(line));
    nodeMeshesRef.current = [];
    edgeLinesRef.current = [];

    // Recreate nodes
    currentNodes.forEach((node, index) => {
      const geometry = new THREE.SphereGeometry(3.0, 16, 16);
      const material = new THREE.MeshPhongMaterial({
        color: nodeColor,
        emissive: nodeColor,
        emissiveIntensity: 0.4,
        shininess: 100
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...node.position);
      mesh.userData = { nodeIndex: index };
      
      const glowGeometry = new THREE.SphereGeometry(3.5, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: nodeColor,
        transparent: true,
        opacity: 0.4
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      mesh.add(glow);
      
      scene.add(mesh);
      nodeMeshesRef.current.push(mesh);
    });

    // Recreate edges
    currentEdges.forEach(edge => {
      const source = currentNodes[edge.source];
      const target = currentNodes[edge.target];
      
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...source.position),
        new THREE.Vector3(...target.position)
      ]);
      
      const material = new THREE.LineBasicMaterial({
        color: nodeColor,
        transparent: true,
        opacity: 0.3
      });
      
      const line = new THREE.Line(geometry, material);
      scene.add(line);
      edgeLinesRef.current.push(line);
    });
  }, [nodes, edges]);

  return <div ref={containerRef} className="w-full h-full" />;
}

