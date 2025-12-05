import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

// --- Types & Interfaces ---
interface VedicChart3DProps {
  chartData: any;
}

// --- Constants ---
const CHART_SIZE = 10;
const LINE_COLOR = '#fbbf24'; // Vedic Gold
const LINE_OPACITY = 0.6;
const PLANET_COLORS: Record<string, string> = {
  Sun: '#FDB813',       // Golden Yellow
  Moon: '#E2E8F0',      // Silvery White
  Mars: '#EF4444',      // Red
  Mercury: '#22C55E',   // Green
  Jupiter: '#EAB308',   // Yellow
  Venus: '#F472B6',     // Pink
  Saturn: '#3B82F6',    // Blue
  Rahu: '#64748B',      // Smoky Grey
  Ketu: '#475569',      // Dark Grey
  Ascendant: '#A855F7', // Purple
};

// --- Helper Components ---

// 1. Planet Sphere
const Planet = ({ position, color, size, name }: { position: [number, number, number], color: string, size: number, name: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position}>
        {/* Planet Core */}
        <mesh ref={meshRef}>
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={2} 
            toneMapped={false}
            transparent
            opacity={0.9}
          />
        </mesh>
        
        {/* Glow Halo */}
        <mesh scale={[1.4, 1.4, 1.4]}>
          <sphereGeometry args={[size, 32, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>

        {/* Label */}
        <Text
          position={[0, size + 0.4, 0]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="bottom"
          font="/fonts/Inter-Bold.woff" // Optional: Use a nice font if available, else default
        >
          {name}
        </Text>
      </group>
    </Float>
  );
};

// 2. North Indian Chart Lines (The Diamond/Grid)
const NorthIndianGrid = () => {
  const points = useMemo(() => {
    const s = CHART_SIZE / 2;
    // North Indian Chart Lines
    // Outer Box: (-s, s) to (s, s) to (s, -s) to (-s, -s)
    // Diagonals: (-s, -s) to (s, s) AND (-s, s) to (s, -s)
    // Diamond: (0, s) to (s, 0) to (0, -s) to (-s, 0) to (0, s)
    
    // We construct distinct lines
    return [
      // Outer Box
      [[-s, s, 0], [s, s, 0]],
      [[s, s, 0], [s, -s, 0]],
      [[s, -s, 0], [-s, -s, 0]],
      [[-s, -s, 0], [-s, s, 0]],
      // Diagonals
      [[-s, s, 0], [s, -s, 0]],
      [[-s, -s, 0], [s, s, 0]],
      // Inner Diamond
      [[0, s, 0], [s, 0, 0]],
      [[s, 0, 0], [0, -s, 0]],
      [[0, -s, 0], [-s, 0, 0]],
      [[-s, 0, 0], [0, s, 0]],
    ].map(line => line.map(p => new THREE.Vector3(p[0], p[1], p[2])));
  }, []);

  return (
    <group>
      {points.map((line, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              args={[new Float32Array([
                line[0].x, line[0].y, line[0].z,
                line[1].x, line[1].y, line[1].z
              ]), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color={LINE_COLOR} transparent opacity={LINE_OPACITY} linewidth={2} />
        </line>
      ))}
    </group>
  );
};

// --- Main Component ---

const VedicChart3D: React.FC<VedicChart3DProps> = ({ chartData }) => {
  if (!chartData) return null;

  // 1. Calculate Planet Positions (House Logic)
  // North Indian Chart has FIXED House positions.
  // 12 Houses map to specific coordinate zones in the grid.
  // We can approximate central points for each "triangle" or "diamond" area.
  const s = CHART_SIZE / 2;
  const q = s / 2; // Quarter step
  
  // House Centroids (Approximate for placement)
  const HOUSE_POSITIONS: Record<number, [number, number, number]> = {
    1: [0, s * 0.6, 0],      // Top Diamond (Ascendant)
    2: [-q, s * 0.6, 0],     // Top-Left Triangle
    3: [-s * 0.6, q, 0],     // Left-Top Triangle
    4: [-s * 0.6, 0, 0],     // Left Diamond
    5: [-s * 0.6, -q, 0],    // Left-Bottom Triangle
    6: [-q, -s * 0.6, 0],    // Bottom-Left Triangle
    7: [0, -s * 0.6, 0],     // Bottom Diamond
    8: [q, -s * 0.6, 0],     // Bottom-Right Triangle
    9: [s * 0.6, -q, 0],     // Right-Bottom Triangle
    10: [s * 0.6, 0, 0],     // Right Diamond
    11: [s * 0.6, q, 0],     // Right-Top Triangle
    12: [q, s * 0.6, 0],     // Top-Right Triangle
  };

  // 2. Map Planets to Houses
  // We need to know which HOUSE a planet is in. 
  // chartData usually provides 'planets' with 'sign' info.
  // In North Indian chart, House 1 is fixed. The Sign in House 1 is the Ascendant Sign.
  // So if Ascendant is Cancer (4), House 1 = Cancer. 
  // House 2 = Leo (5), etc.
  
  // Let's assume chartData provides:
  // - ascendant_sign_id (1-12)
  // - planets: { Sun: { sign_id: 8, ... }, ... }
  
  const ascendantSignId = chartData.ascendant?.sign_id || 1; // Default Aries if missing
  
  const getHouseForSign = (signId: number) => {
    // House 1 has sign = ascendantSignId
    // House N has sign = (ascendantSignId + N - 2) % 12 + 1
    // Reversing: If planet is in sign S, what House H is it?
    // S = (Asc + H - 2) % 12 + 1
    // Let's solve for H:
    // delta = signId - ascendantSignId
    // if delta < 0: delta += 12
    // House = delta + 1
    
    let delta = signId - ascendantSignId;
    if (delta < 0) delta += 12;
    return delta + 1;
  };

  // Prepare objects to render
  const renderedObjects = useMemo(() => {
    const objects = [];

    // Planets
    if (chartData.planets) {
      // Group planets by house to handle overlaps
      const houseOccupants: Record<number, any[]> = {};

      Object.entries(chartData.planets).forEach(([name, data]: [string, any]) => {
        const houseNum = getHouseForSign(data.sign_id);
        if (!houseOccupants[houseNum]) houseOccupants[houseNum] = [];
        houseOccupants[houseNum].push({ name, ...data });
      });

      // Assign positions
      Object.entries(houseOccupants).forEach(([houseStr, planets]) => {
        const houseNum = parseInt(houseStr);
        const center = HOUSE_POSITIONS[houseNum];
        
        planets.forEach((planet: any, index: number) => {
          // Offset multiple planets slightly
          const offsetX = (index - (planets.length - 1) / 2) * 0.8;
          const pos: [number, number, number] = [center[0] + offsetX, center[1] - (index % 2 * 0.3), center[2] + (index * 0.2)];
          
          objects.push(
            <Planet 
              key={planet.name} 
              name={planet.name} 
              position={pos}
              color={PLANET_COLORS[planet.name] || '#FFFFFF'}
              size={0.35}
            />
          );
        });
      });
    }

    // House Numbers (Signs)
    // In North Indian style, we draw the Sign Number in the House to indicate which sign it is.
    for (let h = 1; h <= 12; h++) {
       const signNum = (ascendantSignId + h - 2) % 12 + 1;
       const pos = HOUSE_POSITIONS[h];
       // Place label slightly tucked away or smaller
       objects.push(
         <Text
           key={`house-${h}`}
           position={[pos[0], pos[1] - 0.8, pos[2]]}
           fontSize={0.2}
           color="#fbbf24"
           fillOpacity={0.5}
         >
           {signNum}
         </Text>
       );
    }

    return objects;
  }, [chartData]);


  return (
    <div className="w-full h-full min-h-[500px] bg-slate-900 rounded-xl overflow-hidden relative border border-white/10">
      <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
        {/* Cinematic Lighting */}
        <ambientLight intensity={0.2} color="#0f172a" />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#38bdf8" />
        <pointLight position={[-10, -10, -5]} intensity={1} color="#fbbf24" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

        <group rotation={[0, 0, 0]}>
           <NorthIndianGrid />
           {renderedObjects}
        </group>
      </Canvas>

      {/* Overlay Title */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <h3 className="text-vedic-gold font-serif text-lg opacity-80">Kundali</h3>
        <p className="text-xs text-blue-300">North Indian Layout</p>
      </div>
    </div>
  );
};

export default VedicChart3D;
