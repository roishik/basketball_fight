import { useTexture } from "@react-three/drei";
import { useBasketballGame } from "../lib/stores/useBasketballGame";
import { useEffect } from "react";
import * as THREE from "three";

const BasketballCourt = () => {
  const { addBoundary } = useBasketballGame();
  
  // Load wood texture for the court
  const woodTexture = useTexture("/textures/wood.jpg");
  
  // Configure texture
  woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(8, 5);
  
  // Create court boundaries when component mounts
  useEffect(() => {
    // Add court boundaries (20m x 12m rectangle)
    // These are invisible walls to keep the player within the court
    
    // Left wall
    addBoundary({
      min: { x: -10, y: 0, z: -10 },
      max: { x: -9.9, y: 5, z: 2 }
    });
    
    // Right wall
    addBoundary({
      min: { x: 10, y: 0, z: -10 },
      max: { x: 9.9, y: 5, z: 2 }
    });
    
    // Back wall
    addBoundary({
      min: { x: -10, y: 0, z: -10 },
      max: { x: 10, y: 5, z: -9.9 }
    });
    
    // Front wall
    addBoundary({
      min: { x: -10, y: 0, z: 2 },
      max: { x: 10, y: 5, z: 1.9 }
    });
  }, []);

  return (
    <>
      {/* Court floor */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, -4]} 
        receiveShadow
      >
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial map={woodTexture} />
      </mesh>
      
      {/* Court markings - Center circle */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.01, -4]}
      >
        <ringGeometry args={[1.8, 2, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Free throw line */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.01, -6]}
      >
        <planeGeometry args={[5, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Three point line (arc) */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.01, -4]}
      >
        <ringGeometry args={[6, 6.1, 32, 1, 0, Math.PI]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </>
  );
};

export default BasketballCourt;
