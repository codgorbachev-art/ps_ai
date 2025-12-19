
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function Particles(props: any) {
  const ref = useRef<THREE.Points>(null);
  
  const [positions, colors, initialPositions] = useMemo(() => {
    const count = 1800; 
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const initial = new Float32Array(count * 3);
    const color1 = new THREE.Color('#00f0ff');
    const color2 = new THREE.Color('#7000ff');

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 15;
      const y = (Math.random() - 0.5) * 15;
      const z = (Math.random() - 0.5) * 12;
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      initial[i * 3] = x;
      initial[i * 3 + 1] = y;
      initial[i * 3 + 2] = z;

      const mixedColor = color1.clone().lerp(color2, Math.random());
      cols[i * 3] = mixedColor.r;
      cols[i * 3 + 1] = mixedColor.g;
      cols[i * 3 + 2] = mixedColor.b;
    }
    return [pos, cols, initial];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (ref.current) {
      const positionsAttr = ref.current.geometry.attributes.position;
      for (let i = 0; i < initialPositions.length / 3; i++) {
        const i3 = i * 3;
        // Organic drift using combined sin/cos waves (Perlin-like effect)
        positionsAttr.setX(i, initialPositions[i3] + Math.sin(time * 0.2 + initialPositions[i3 + 1] * 0.5) * 0.4);
        positionsAttr.setY(i, initialPositions[i3 + 1] + Math.cos(time * 0.3 + initialPositions[i3] * 0.5) * 0.4);
      }
      positionsAttr.needsUpdate = true;
      ref.current.rotation.z = time * 0.05;
    }
  });

  return (
    <Points ref={ref} positions={positions} colors={colors} stride={3} frustumCulled={false} {...props}>
      <PointMaterial
        transparent
        vertexColors
        size={0.04}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.4}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

const GlowBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-[#020202]">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-brand-purple/10 rounded-full blur-[150px] opacity-60" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-brand-cyan/10 rounded-full blur-[150px] opacity-60" />
      
      <Canvas 
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 1.2]} 
        gl={{ 
          antialias: false,
          powerPreference: "high-performance",
          alpha: true,
          stencil: false,
          depth: false
        }}
      >
        <Particles />
      </Canvas>
    </div>
  );
};

export default GlowBackground;
