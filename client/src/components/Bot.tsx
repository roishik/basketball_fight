import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useBasketballGame } from "../lib/stores/useBasketballGame";
import * as THREE from "three";

interface BotProps {
  position: [number, number, number];
  name: string;
}

const Bot = ({ position, name }: BotProps) => {
  const {
    addBot,
    throwBotBall,
    hoopPosition
  } = useBasketballGame();

  const botRef = useRef<THREE.Group>(null);
  const botId = useRef(name);
  const cooldownRef = useRef(0);
  const stateRef = useRef<'idle' | 'aiming' | 'throwing' | 'cooldown'>('idle');
  const positionRef = useRef(new THREE.Vector3(...position));
  const aimTargetRef = useRef(new THREE.Vector3());

  // Initialize bot when component mounts
  useEffect(() => {
    addBot({
      id: botId.current,
      position: {
        x: position[0],
        y: position[1],
        z: position[2]
      }
    });
  }, []);

  // Bot AI state machine
  useFrame((_, delta) => {
    if (!botRef.current) return;
    
    // Update cooldown
    if (cooldownRef.current > 0) {
      cooldownRef.current -= delta;
    }
    
    // State machine
    switch (stateRef.current) {
      case 'idle':
        if (cooldownRef.current <= 0) {
          // Transition to aiming state
          stateRef.current = 'aiming';
          
          // Pick a random position within 2m semicircle
          const randomAngle = (Math.random() - 0.5) * Math.PI;
          const randomDist = 1 + Math.random();
          
          // Update bot position slightly (move around in a small area)
          positionRef.current.x = position[0] + Math.sin(randomAngle) * randomDist;
          positionRef.current.z = position[2] + Math.cos(randomAngle) * randomDist;
          
          botRef.current.position.copy(positionRef.current);
        }
        break;
        
      case 'aiming':
        // Calculate direction to hoop
        const hoopPos = new THREE.Vector3(hoopPosition.x, hoopPosition.y, hoopPosition.z);
        const direction = hoopPos.clone().sub(positionRef.current).normalize();
        
        // Add inaccuracy (±3°)
        const inaccuracy = (Math.random() - 0.5) * 0.1; // ~±3 degrees in radians
        direction.x += inaccuracy;
        direction.y += inaccuracy;
        direction.normalize();
        
        // Calculate required velocity using projectile motion formula
        // For a target at height h and horizontal distance d, with gravity g:
        // v = sqrt((d^2 * g) / (2 * (h - h0) * cos^2(θ) - 2 * d * sin(θ) * cos(θ)))
        
        const horizontalDist = new THREE.Vector2(
          hoopPos.x - positionRef.current.x,
          hoopPos.z - positionRef.current.z
        ).length();
        
        const heightDiff = hoopPos.y - positionRef.current.y;
        const gravity = 9.81;
        
        // Calculate angle in the vertical plane
        const angle = Math.atan2(direction.y, Math.sqrt(direction.x * direction.x + direction.z * direction.z));
        
        // Calculate initial velocity magnitude (simplified physics)
        let speed = Math.sqrt(
          (horizontalDist * horizontalDist * gravity) / 
          (2 * (heightDiff + horizontalDist * Math.tan(angle)))
        );
        
        // Clamp speed to reasonable values
        speed = Math.min(Math.max(speed, 8), 15);
        
        // Store aim target for throwing
        aimTargetRef.current = direction.clone().multiplyScalar(speed);
        
        // Move to throwing state
        stateRef.current = 'throwing';
        break;
        
      case 'throwing':
        // Throw the ball
        throwBotBall({
          position: {
            x: positionRef.current.x,
            y: positionRef.current.y + 1.7, // Approximate hand height
            z: positionRef.current.z
          },
          velocity: {
            x: aimTargetRef.current.x,
            y: aimTargetRef.current.y,
            z: aimTargetRef.current.z
          },
          owner: botId.current
        });
        
        // Transition to cooldown
        stateRef.current = 'cooldown';
        cooldownRef.current = 2 + Math.random() * 3; // 2-5 seconds cooldown
        break;
        
      case 'cooldown':
        if (cooldownRef.current <= 0) {
          stateRef.current = 'idle';
        }
        break;
    }
  });

  return (
    <group ref={botRef} position={position}>
      {/* Simple bot body */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[0.6, 2, 0.6]} />
        <meshStandardMaterial color={name === "Bot L" ? "#4444ff" : "#ff4444"} />
      </mesh>
      
      {/* Bot head */}
      <mesh position={[0, 2.15, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color={name === "Bot L" ? "#8888ff" : "#ff8888"} />
      </mesh>
    </group>
  );
};

export default Bot;
