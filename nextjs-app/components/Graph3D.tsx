'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { Node, Edge } from '@/types';
import { getCategoryColor } from '@/lib/colors';

interface Graph3DProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick?: (nodeIndex: number) => void;
  paused?: boolean;
}

export default function Graph3D({ nodes, edges, onNodeClick, paused = false }: Graph3DProps) {
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
  const onNodeClickRef = useRef(onNodeClick);

  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
  }, [onNodeClick]);

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
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

    // Create graph function
    const createGraph = () => {
      // Clear existing meshes
      nodeMeshesRef.current.forEach(mesh => {
        scene.remove(mesh);
        mesh.geometry.dispose();
        const material = mesh.material;
        if (Array.isArray(material)) {
          material.forEach(mat => mat.dispose());
        } else {
          material.dispose();
        }
      });
      edgeLinesRef.current.forEach(line => {
        scene.remove(line);
        line.geometry.dispose();
        const material = line.material;
        if (Array.isArray(material)) {
          material.forEach(mat => mat.dispose());
        } else {
          material.dispose();
        }
      });
      nodeMeshesRef.current = [];
      edgeLinesRef.current = [];

      const currentNodes = nodesRef.current;
      const currentEdges = edgesRef.current;

      // Create nodes with category-based colors
      currentNodes.forEach((node, index) => {
        const nodeColor = getCategoryColor(node.episode.categories);
        
        const geometry = new THREE.SphereGeometry(3.0, 16, 16);
        const material = new THREE.MeshPhongMaterial({
          color: nodeColor,
          emissive: nodeColor,
          emissiveIntensity: 0.4,
          shininess: 100
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...node.position);
        mesh.userData = { nodeIndex: index, episode: node.episode };
        
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
        
        if (!source || !target) return;
        
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(...source.position),
          new THREE.Vector3(...target.position)
        ]);
        
        const material = new THREE.LineBasicMaterial({
          color: 0x4a9eff,
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
      if (!containerRef.current || !cameraRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(nodeMeshesRef.current, true);

      if (intersects.length > 0) {
        event.preventDefault();
        event.stopPropagation();
        
        const clickedMesh = intersects[0].object as THREE.Mesh;
        // Traverse up to find the actual mesh (might be inside a group)
        let actualMesh = clickedMesh;
        while (actualMesh.parent && actualMesh.parent !== scene) {
          actualMesh = actualMesh.parent as THREE.Mesh;
        }
        
        const nodeIndex = actualMesh.userData.nodeIndex ?? clickedMesh.userData.nodeIndex;
        
        if (nodeIndex !== undefined && nodeIndex !== null && onNodeClickRef.current) {
          onNodeClickRef.current(nodeIndex);
        }
      }
    };

    containerRef.current.addEventListener('click', handleClick, { passive: false });

    // Force-directed layout (simplified for performance)
    const updateLayout = () => {
      const currentNodes = nodesRef.current;
      const currentEdges = edgesRef.current;
      
      if (currentNodes.length === 0) return;
      
      const repulsionStrength = 0.03; // Reduced from 0.1
      const attractionStrength = 0.003; // Reduced from 0.01
      const damping = 0.95; // Increased from 0.9 for slower movement

      // Repulsion between all nodes (limit iterations for performance)
      const maxRepulsionChecks = Math.min(currentNodes.length * 10, 5000);
      let repulsionCount = 0;
      
      for (let i = 0; i < currentNodes.length && repulsionCount < maxRepulsionChecks; i++) {
        for (let j = i + 1; j < currentNodes.length && repulsionCount < maxRepulsionChecks; j++) {
          repulsionCount++;
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
        if (!source || !target) return;
        
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

      // Update positions with velocity limits
      const maxVelocity = 0.5; // Limit maximum velocity
      currentNodes.forEach((node, index) => {
        node.velocity[0] *= damping;
        node.velocity[1] *= damping;
        node.velocity[2] *= damping;
        
        // Cap velocity to prevent excessive movement
        node.velocity[0] = Math.max(-maxVelocity, Math.min(maxVelocity, node.velocity[0]));
        node.velocity[1] = Math.max(-maxVelocity, Math.min(maxVelocity, node.velocity[1]));
        node.velocity[2] = Math.max(-maxVelocity, Math.min(maxVelocity, node.velocity[2]));
        
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

      // Update edge lines (only update if changed significantly)
      currentEdges.forEach((edge, index) => {
        if (edgeLinesRef.current[index]) {
          const source = currentNodes[edge.source];
          const target = currentNodes[edge.target];
          if (!source || !target) return;
          
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
        const material = mesh.material;
        if (Array.isArray(material)) {
          material.forEach(mat => mat.dispose());
        } else {
          material.dispose();
        }
        scene.remove(mesh);
      });
      
      edgeLinesRef.current.forEach(line => {
        line.geometry.dispose();
        const material = line.material;
        if (Array.isArray(material)) {
          material.forEach(mat => mat.dispose());
        } else {
          material.dispose();
        }
        scene.remove(line);
      });
      
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Update graph when nodes/edges change - preserve positions
  useEffect(() => {
    if (!sceneRef.current) return;
    
    const scene = sceneRef.current;
    const currentNodes = nodesRef.current;
    const currentEdges = edgesRef.current;

    // Store existing positions before clearing
    const existingPositions = new Map<string, [number, number, number]>();
    nodeMeshesRef.current.forEach((mesh, idx) => {
      if (mesh.userData.episode) {
        existingPositions.set(mesh.userData.episode.episode_name, [
          mesh.position.x,
          mesh.position.y,
          mesh.position.z
        ]);
      }
    });

    // Clear existing
    nodeMeshesRef.current.forEach(mesh => {
      mesh.geometry.dispose();
      const material = mesh.material;
      if (Array.isArray(material)) {
        material.forEach(mat => mat.dispose());
      } else {
        material.dispose();
      }
      scene.remove(mesh);
    });
    edgeLinesRef.current.forEach(line => {
      line.geometry.dispose();
      const material = line.material;
      if (Array.isArray(material)) {
        material.forEach(mat => mat.dispose());
      } else {
        material.dispose();
      }
      scene.remove(line);
    });
    nodeMeshesRef.current = [];
    edgeLinesRef.current = [];

    // Recreate nodes with category colors - preserve positions if they exist
    currentNodes.forEach((node, index) => {
      // Use existing position if available, otherwise use node's position
      const existingPos = existingPositions.get(node.episode.episode_name);
      if (existingPos) {
        node.position[0] = existingPos[0];
        node.position[1] = existingPos[1];
        node.position[2] = existingPos[2];
        // Reset velocity to prevent sudden movement
        node.velocity[0] = 0;
        node.velocity[1] = 0;
        node.velocity[2] = 0;
      }
      
      const nodeColor = getCategoryColor(node.episode.categories);
      
      const geometry = new THREE.SphereGeometry(3.0, 16, 16);
      const material = new THREE.MeshPhongMaterial({
        color: nodeColor,
        emissive: nodeColor,
        emissiveIntensity: 0.4,
        shininess: 100
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...node.position);
      mesh.userData = { nodeIndex: index, episode: node.episode };
      
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
      
      if (!source || !target) return;
      
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...source.position),
        new THREE.Vector3(...target.position)
      ]);
      
      const material = new THREE.LineBasicMaterial({
        color: 0x4a9eff,
        transparent: true,
        opacity: 0.3
      });
      
      const line = new THREE.Line(geometry, material);
      scene.add(line);
      edgeLinesRef.current.push(line);
    });
  }, [nodes, edges]);
  
  // Update paused state
  useEffect(() => {
    // When paused, stop all node velocities
    if (paused) {
      nodesRef.current.forEach(node => {
        node.velocity[0] = 0;
        node.velocity[1] = 0;
        node.velocity[2] = 0;
      });
    }
  }, [paused]);

  return <div ref={containerRef} className="w-full h-full" />;
}
