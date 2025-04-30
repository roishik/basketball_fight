import { useEffect, useMemo, useRef } from "react";
import { useBasketballGame } from "../lib/stores/useBasketballGame";
import * as THREE from "three";

interface HoopProps {
  position: [number, number, number];
}

const Hoop = ({ position }: HoopProps) => {
  const { setHoopPosition } = useBasketballGame();
  const hoopRef = useRef<THREE.Group>(null);
  
  // Set hoop position in game state
  useEffect(() => {
    setHoopPosition({
      x: position[0],
      y: position[1],
      z: position[2]
    });
  }, []);
  
  // Create hoop ring geometry
  const hoopRingGeometry = useMemo(() => {
    const hoopRadius = 0.45; // Hoop radius (45cm)
    const tubeRadius = 0.02; // Thickness of the hoop
    return new THREE.TorusGeometry(hoopRadius, tubeRadius, 16, 64);
  }, []);
  
  // Create backboard geometry
  const backboardGeometry = useMemo(() => {
    return new THREE.BoxGeometry(1.8, 1.2, 0.05);
  }, []);
  
  // Create support pole geometry
  const poleGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(0.1, 0.1, 3, 16);
  }, []);
  
  return (
    <group ref={hoopRef} position={position}>
      {/* Main backboard */}
      <mesh position={[0, 0, 0.1]} castShadow receiveShadow>
        <primitive object={backboardGeometry} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Target square on backboard */}
      <mesh position={[0, -0.2, 0.13]} receiveShadow>
        <boxGeometry args={[0.6, 0.45, 0.01]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      
      {/* Hoop ring */}
      <mesh position={[0, -0.4, 0.5]} rotation={[Math.PI/2, 0, 0]} castShadow>
        <primitive object={hoopRingGeometry} />
        <meshStandardMaterial color="#ff6600" />
      </mesh>
      
      {/* Net (simplified as a cylinder with holes) */}
      <mesh position={[0, -0.7, 0.5]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.42, 0.3, 0.6, 16, 4, true]} />
        <meshStandardMaterial color="#ffffff" wireframe={true} wireframeLinewidth={2} />
      </mesh>
      
      {/* Support pole */}
      <mesh position={[0, -1.5, -0.5]} castShadow>
        <primitive object={poleGeometry} />
        <meshStandardMaterial color="#888888" />
      </mesh>
      
      {/* Base */}
      <mesh position={[0, -3, -0.5]} rotation={[Math.PI/2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[0.7, 0.7, 0.2, 16]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      
      {/* Invisible scoring detector cylinder */}
      <mesh position={[0, -0.4, 0.5]} rotation={[Math.PI/2, 0, 0]} visible={false}>
        <cylinderGeometry args={[0.45, 0.45, 0.1, 16]} />
        <meshBasicMaterial color="#00ff00" transparent={true} opacity={0.3} />
      </mesh>
    </group>
  );
};

export default Hoop;
