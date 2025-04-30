import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useBasketballGame } from "../lib/stores/useBasketballGame";
import * as THREE from "three";

const PlasmaGun = () => {
  const { camera } = useThree();
  const gunRef = useRef<THREE.Group>(null);
  const { currentWeapon } = useBasketballGame();
  
  // Update gun position to follow camera
  useFrame(() => {
    if (!gunRef.current || currentWeapon !== 'gun') return;
    
    // Get camera direction and position
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    
    // Position gun model in front of camera
    const cameraPos = camera.position.clone();
    const gunPos = cameraPos.clone().add(
      cameraDirection.clone().multiplyScalar(0.5) // Position 0.5 units in front
        .add(new THREE.Vector3(0.3, -0.3, 0)) // Offset to the right and down
    );
    
    // Position the gun
    gunRef.current.position.copy(gunPos);
    
    // Rotate gun to match camera
    gunRef.current.rotation.copy(camera.rotation);
  });

  return (
    <group ref={gunRef}>
      {/* Gun base */}
      <mesh castShadow>
        <boxGeometry args={[0.1, 0.1, 0.4]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      
      {/* Gun barrel */}
      <mesh position={[0, 0, -0.25]} castShadow>
        <cylinderGeometry args={[0.03, 0.05, 0.5, 16]} rotation={[Math.PI/2, 0, 0]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      
      {/* Energy chamber */}
      <mesh position={[0, 0.08, -0.1]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color="#00ffff" 
          emissive="#00ffff"
          emissiveIntensity={2}
          transparent={true}
          opacity={0.8}
        />
      </mesh>
      
      {/* Handle */}
      <mesh position={[0, -0.1, 0]} castShadow>
        <boxGeometry args={[0.08, 0.2, 0.1]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
    </group>
  );
};

export default PlasmaGun;
