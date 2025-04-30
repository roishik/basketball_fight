import { useThree, useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import { Controls } from "../lib/constants";
import { useBasketballGame } from "../lib/stores/useBasketballGame";
import { toggleBackgroundMusic } from "../lib/sounds";
import PlasmaGun from "./PlasmaGun";
import * as THREE from "three";

const Player = () => {
  const { 
    playerPosition, 
    updatePlayerPosition, 
    playerRotation,
    updatePlayerRotation,
    throwBall,
    shootGun,
    toggleWeapon,
    currentWeapon,
    isCharging,
    startCharging,
    releaseCharge,
    playerScore
  } = useBasketballGame();
  
  // Add vertical look angle state
  const [verticalAngle, setVerticalAngle] = useState(0);
  
  const { camera } = useThree();
  const [chargeTime, setChargeTime] = useState(0);
  const [chargeStrength, setChargeStrength] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  
  // Camera direction for throwing/shooting
  const cameraDirection = useRef(new THREE.Vector3());
  const cameraPosition = useRef(new THREE.Vector3());
  
  // Current movement velocity
  const velocity = useRef({ x: 0, z: 0 });
  
  // Get keyboard controls state (for rendering changes)
  const forward = useKeyboardControls<Controls>(state => state.forward);
  const backward = useKeyboardControls<Controls>(state => state.backward);
  const left = useKeyboardControls<Controls>(state => state.left);
  const right = useKeyboardControls<Controls>(state => state.right);
  const turnLeft = useKeyboardControls<Controls>(state => state.turnLeft);
  const turnRight = useKeyboardControls<Controls>(state => state.turnRight);
  const lookUp = useKeyboardControls<Controls>(state => state.lookUp);
  const lookDown = useKeyboardControls<Controls>(state => state.lookDown);
  const action = useKeyboardControls<Controls>(state => state.action);
  const toggleGun = useKeyboardControls<Controls>(state => state.toggleGun);
  const toggleMute = useKeyboardControls<Controls>(state => state.toggleMute);
  
  // Initialize player position
  useEffect(() => {
    updatePlayerPosition({ x: 0, y: 1.6, z: 0 });
    // Initialize camera position and rotation
    camera.position.set(0, 1.6, 0);
    camera.rotation.set(0, Math.PI, 0); // Look toward the basket (which is in -z)
    updatePlayerRotation(Math.PI);
  }, []);
  
  // Handle toggling weapon
  useEffect(() => {
    if (toggleGun && cooldown === 0) {
      toggleWeapon();
      setCooldown(10); // Add small cooldown to prevent rapid toggling
    }
  }, [toggleGun]);
  
  // Handle toggling sound
  useEffect(() => {
    if (toggleMute) {
      toggleBackgroundMusic();
    }
  }, [toggleMute]);
  
  // Handle weapon action (throw ball or shoot gun)
  useEffect(() => {
    if (action) {
      if (currentWeapon === 'ball') {
        if (!isCharging) {
          console.log("Start charging throw");
          startCharging();
          setChargeTime(Date.now());
        }
      } else if (currentWeapon === 'gun' && cooldown === 0) {
        // Get camera direction and position for shooting
        camera.getWorldDirection(cameraDirection.current);
        cameraPosition.current.copy(camera.position);
        
        // Shoot gun
        shootGun({
          position: {
            x: cameraPosition.current.x,
            y: cameraPosition.current.y,
            z: cameraPosition.current.z
          },
          direction: {
            x: cameraDirection.current.x,
            y: cameraDirection.current.y,
            z: cameraDirection.current.z
          }
        });
        
        setCooldown(15); // Cooldown in frames
      }
    } else if (isCharging) {
      // Calculate charge strength based on hold duration
      const chargeStrength = Math.min((Date.now() - chargeTime) / 1000 * 4, 12);
      console.log(`Releasing throw with strength: ${chargeStrength}`);
      
      // Get camera direction and position for throwing
      camera.getWorldDirection(cameraDirection.current);
      cameraPosition.current.copy(camera.position);
      
      // Use the vertical angle from the camera rotation for throwing direction
      // Instead of a fixed bias, we'll use the actual vertical angle plus a small bias
      // This implements requirement #3 for vertical throw angles
      
      // Throw the ball
      throwBall({
        position: {
          x: cameraPosition.current.x,
          y: cameraPosition.current.y - 0.2, // Slightly lower than camera to see the ball
          z: cameraPosition.current.z
        },
        velocity: {
          x: cameraDirection.current.x * chargeStrength,
          y: cameraDirection.current.y * chargeStrength,
          z: cameraDirection.current.z * chargeStrength
        }
      });
      
      releaseCharge();
    }
  }, [action]);
  
  // Main game loop
  useFrame((state, delta) => {
    // Handle cooldown
    if (cooldown > 0) {
      setCooldown(cooldown - 1);
    }
    
    // Update charge strength meter if charging
    if (isCharging) {
      const newStrength = Math.min((Date.now() - chargeTime) / 1000 * 4, 12);
      setChargeStrength(newStrength);
    } else if (chargeStrength !== 0) {
      setChargeStrength(0);
    }
    
    // Handle keyboard movement
    const moveSpeed = 4 * delta; // 4 m/s
    const turnSpeed = 5 * Math.PI / 180; // 5 degrees per press
    
    // Reset velocity
    velocity.current = { x: 0, z: 0 };
    
    // Calculate forward/backward movement in direction of camera
    if (forward) {
      velocity.current.x -= Math.sin(playerRotation) * moveSpeed;
      velocity.current.z -= Math.cos(playerRotation) * moveSpeed;
    }
    if (backward) {
      velocity.current.x += Math.sin(playerRotation) * moveSpeed;
      velocity.current.z += Math.cos(playerRotation) * moveSpeed;
    }
    
    // Calculate strafe left/right movement perpendicular to camera
    if (left) {
      velocity.current.x -= Math.sin(playerRotation + Math.PI/2) * moveSpeed;
      velocity.current.z -= Math.cos(playerRotation + Math.PI/2) * moveSpeed;
    }
    if (right) {
      velocity.current.x += Math.sin(playerRotation + Math.PI/2) * moveSpeed;
      velocity.current.z += Math.cos(playerRotation + Math.PI/2) * moveSpeed;
    }
    
    // Update player rotation - exclusively with arrow keys now
    if (turnLeft) {
      updatePlayerRotation(playerRotation + turnSpeed);
    }
    if (turnRight) {
      updatePlayerRotation(playerRotation - turnSpeed);
    }
    
    // Add vertical look (up/down) using arrow keys for requirement #3
    const lookSpeed = 2 * Math.PI / 180; // 2 degrees per press
    if (lookUp) {
      const newAngle = Math.max(verticalAngle - lookSpeed, -Math.PI / 3); // Limit up look to 60 degrees
      setVerticalAngle(newAngle);
      camera.rotation.x = newAngle;
    }
    if (lookDown) {
      const newAngle = Math.min(verticalAngle + lookSpeed, Math.PI / 3); // Limit down look to 60 degrees
      setVerticalAngle(newAngle);
      camera.rotation.x = newAngle;
    }
    
    // Update player position with boundary checks
    const newX = playerPosition.x + velocity.current.x;
    const newZ = playerPosition.z + velocity.current.z;
    
    // Simple boundary checks (court is 20x12)
    const boundX = Math.max(-9.5, Math.min(9.5, newX));
    const boundZ = Math.max(-9.5, Math.min(1.5, newZ));
    
    updatePlayerPosition({
      x: boundX,
      y: playerPosition.y, 
      z: boundZ
    });
    
    // Update camera position and rotation
    camera.position.set(boundX, playerPosition.y, boundZ);
    camera.rotation.y = playerRotation;
  });
  
  return (
    <>
      {/* First person camera, so we don't render the player's body */}
      
      {/* Render the gun model when in gun mode */}
      {currentWeapon === 'gun' && (
        <PlasmaGun />
      )}
      
      {/* Throw strength charge indicator (requirement #2) */}
      {isCharging && currentWeapon === 'ball' && (
        <div 
          style={{
            position: 'absolute',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '200px',
            height: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '10px',
            overflow: 'hidden',
            pointerEvents: 'none'
          }}
        >
          <div
            style={{
              width: `${(chargeStrength / 12) * 100}%`,
              height: '100%',
              backgroundColor: 
                chargeStrength < 4 ? 'rgb(255, 150, 0)' : 
                chargeStrength < 8 ? 'rgb(0, 255, 0)' : 
                'rgb(255, 0, 0)',
              transition: 'width 0.1s linear'
            }}
          />
        </div>
      )}
    </>
  );
};

export default Player;
