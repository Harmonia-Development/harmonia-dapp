"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";

type NetworkNode = {
  id: string;
  x: number;
  y: number;
  z: number;
  connections?: string[];
};

type NetworkVisualizationProps = {
  data: NetworkNode[];
  color?: string;
  nodeSize?: number;
  className?: string;
  title?: string;
  subtitle?: string;
};

// Node component
function Node({
  position,
  size = 0.15,
  active = false,
  id,
  connections = [],
}: {
  position: [number, number, number];
  size?: number;
  active?: boolean;
  id: string;
  connections?: string[];
}) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Pulse effect for active nodes
  useFrame(({ clock }) => {
    if (ref.current && active) {
      const s = size + Math.sin(clock.getElapsedTime() * 2) * 0.05;
      ref.current.scale.set(s, s, s);
    }
  });

  return (
    <mesh
      ref={ref}
      position={position}
      scale={hovered ? size * 1.5 : size}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color="#a67cff" transparent opacity={0.8} />
      <pointLight color="#a67cff" intensity={0.5} distance={2} />

      {hovered && (
        <Html
          position={[0, size * 2, 0]}
          style={{
            backgroundColor: "rgba(0,0,0,0.8)",
            padding: "6px 10px",
            borderRadius: "4px",
            color: "white",
            fontSize: "14px",
            fontWeight: "bold",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            transform: "translate(-50%, -100%)",
          }}
          center
        >
          <p>{id}</p>
          {connections.length > 0 ? (
            <p>{`connections: [${connections.join(", ")}]`}</p>
          ) : null}
        </Html>
      )}
    </mesh>
  );
}

// Connection line component
function Connection({
  start,
  end,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
}) {
  const ref = useRef<THREE.Line | null>(null);

  const points = useMemo(() => {
    const linePoints = [];
    linePoints.push(new THREE.Vector3(start.x, start.y, start.z));
    linePoints.push(new THREE.Vector3(end.x, end.y, end.z));
    return linePoints;
  }, [start, end]);

  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  useFrame(({ clock }) => {
    if (ref.current) {
      if (ref.current.material instanceof THREE.Material) {
        ref.current.material.opacity =
          0.3 + Math.sin(clock.getElapsedTime() * 1.5) * 0.1;
      }
    }
  });

  return (
    <line ref={ref}>
      <bufferGeometry attach="geometry" {...lineGeometry} />
      <lineBasicMaterial
        attach="material"
        color="#6e45e2"
        transparent
        opacity={0.4}
        linewidth={1}
      />
    </line>
  );
}

// Grid sphere component
function GridSphere() {
  const gridRef = useRef<THREE.LineSegments>(null);

  // Create a wireframe sphere
  const geometry = useMemo(() => {
    return new THREE.SphereGeometry(5, 32, 32);
  }, []);

  useFrame(({ clock }) => {
    if (gridRef.current) {
      gridRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <lineSegments ref={gridRef}>
      <edgesGeometry attach="geometry" args={[geometry]} />
      <lineBasicMaterial
        attach="material"
        color="#3a2a7d"
        transparent
        opacity={0.15}
      />
    </lineSegments>
  );
}

// Network component
function Network({
  data,
  nodeSize,
}: {
  data: NetworkNode[];
  nodeSize: number;
}) {
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set());

  // Generate network data
  useEffect(() => {
    setNodes(data);

    // Randomly set some nodes as active
    const active = new Set<string>();
    data.forEach((node) => {
      if (Math.random() > 0.7) {
        active.add(node.id);
      }
    });
    setActiveNodes(active);

    // Periodically change active nodes
    const interval = setInterval(() => {
      setActiveNodes((prev) => {
        const newActive = new Set(prev);
        const randomNode = data[Math.floor(Math.random() * data.length)];
        if (newActive.has(randomNode.id)) {
          newActive.delete(randomNode.id);
        } else {
          newActive.add(randomNode.id);
        }
        return newActive;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [data]);

  return (
    <group>
      <GridSphere />

      {/* Render nodes */}
      {nodes.map((node) => (
        <Node
          key={node.id}
          position={[node.x, node.y, node.z]}
          active={activeNodes.has(node.id)}
          // size={activeNodes.has(node.id) ? 0.2 : 0.1}
          size={nodeSize}
          id={node.id}
          connections={node.connections}
        />
      ))}

      {/* Render connections */}
      {nodes.map((node) =>
        node.connections?.map((targetId, i) => {
          const target = nodes.find((n) => n.id === targetId);
          if (!target) return null;
          return (
            <Connection
              key={`${node.id}-${targetId}-${i}`}
              start={new THREE.Vector3(node.x, node.y, node.z)}
              end={new THREE.Vector3(target.x, target.y, target.z)}
            />
            // start={node}
            // end={target}
          );
        })
      )}
    </group>
  );
}

export default function NetworkVisualization({
  data,
  nodeSize = 0.15,
  className,
  title = "Network Visualization",
  subtitle = "Stellar blockchain network activity",
}: NetworkVisualizationProps) {
  // Ensure we have valid data
  const safeData = data && data.length > 0 ? data : [];

  return (
    <div className={cn("relative w-full h-[500px] md:h-[600px]", className)}>
      {/* Title and subtitle overlay */}
      <div className="absolute top-0 left-0 z-10 p-4 mb-3 text-white">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-gray-400">{subtitle}</p>
      </div>

      <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
        <Network data={safeData} nodeSize={nodeSize} />
        <OrbitControls
          enablePan={false}
          minDistance={8}
          maxDistance={16}
          rotateSpeed={0.4}
          autoRotate
          autoRotateSpeed={0.4}
        />
      </Canvas>
    </div>
  );
}
