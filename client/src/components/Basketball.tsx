import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface BasketballProps {
  position: { x: number, y: number, z: number };
  id: string;
}

const Basketball = ({ position, id }: BasketballProps) => {
  const ballRef = useRef<THREE.Mesh>(null);
  
  // This component isn't directly used, as we render basketballs
  // directly in the Game component based on the state.
  // It's included here for completeness.
  
  return (
    <mesh 
      ref={ballRef}
      position={[position.x, position.y, position.z]}
      castShadow
    >
      <sphereGeometry args={[0.12, 16, 16]} />
      <meshStandardMaterial color="#ffa500" />
    </mesh>
  );
};

export default Basketball;
