import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface PlasmaBulletProps {
  position: { x: number, y: number, z: number };
  direction: { x: number, y: number, z: number };
  id: string;
}

const PlasmaBullet = ({ position, direction, id }: PlasmaBulletProps) => {
  const bulletRef = useRef<THREE.Mesh>(null);
  
  // This component isn't directly used, as we render bullets
  // directly in the Game component based on the state.
  // It's included here for completeness.
  
  return (
    <mesh 
      ref={bulletRef}
      position={[position.x, position.y, position.z]}
    >
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshStandardMaterial 
        color="#00ffff" 
        emissive="#00ffff"
        emissiveIntensity={2}
      />
    </mesh>
  );
};

export default PlasmaBullet;
