import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { useBasketballGame } from "../lib/stores/useBasketballGame";
import BasketballCourt from "./BasketballCourt";
import Player from "./Player";
import Bot from "./Bot";
import Hoop from "./Hoop";
import { loadSounds } from "../lib/sounds";

const Game = () => {
  const { 
    initGame, 
    basketballs,
    bullets, 
    gamePhase,
    startGame,
    resetGame
  } = useBasketballGame();

  // Initialize game on mount
  useEffect(() => {
    console.log("Initializing game...");
    initGame();
    loadSounds();
    
    // Start game after a short delay
    const timer = setTimeout(() => {
      console.log("Starting game...");
      startGame();
    }, 1500);
    
    return () => {
      clearTimeout(timer);
      resetGame();
    };
  }, []);

  return (
    <Canvas
      shadows
      camera={{
        position: [0, 1.6, 0], // Initial camera height at eye level
        fov: 75,
        near: 0.1,
        far: 1000
      }}
    >
      <color attach="background" args={["#87CEEB"]} />
      
      {/* Main lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <Suspense fallback={null}>
        {/* Court environment */}
        <BasketballCourt />
        
        {/* Hoop */}
        <Hoop position={[0, 3, -9]} />
        
        {/* Player (first-person, so no visible body) */}
        <Player />
        
        {/* Bot players */}
        <Bot position={[-5, 0, -6]} name="Bot L" />
        <Bot position={[5, 0, -6]} name="Bot R" />
        
        {/* Render all active basketballs */}
        {basketballs.map((ball) => {
          // If the ball is exploding, render an explosion effect
          if (ball.exploding) {
            const explosionScale = ball.explosionStartTime 
              ? Math.min(3, ((Date.now() - ball.explosionStartTime) / 1000) * 5) 
              : 1;
            
            return (
              <group key={ball.id} position={[ball.position.x, ball.position.y, ball.position.z]}>
                {/* Explosion core */}
                <mesh scale={explosionScale * 0.3}>
                  <sphereGeometry args={[0.3, 16, 16]} />
                  <meshStandardMaterial color="#ff3300" emissive="#ff3300" emissiveIntensity={2} />
                </mesh>
                
                {/* Explosion outer glow */}
                <mesh scale={explosionScale * 0.8}>
                  <sphereGeometry args={[0.3, 16, 16]} />
                  <meshStandardMaterial 
                    color="#ff9900" 
                    emissive="#ff9900" 
                    emissiveIntensity={1.5}
                    transparent={true}
                    opacity={1 - (explosionScale / 3)}
                  />
                </mesh>
              </group>
            );
          }
          
          // Regular basketball
          return (
            <mesh
              key={ball.id}
              position={[ball.position.x, ball.position.y, ball.position.z]}
              castShadow
            >
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color={ball.owner === 'player' ? "#ff7700" : "#ffa500"} />
            </mesh>
          );
        })}
        
        {/* Render all active bullets */}
        {bullets.map((bullet) => (
          <mesh
            key={bullet.id}
            position={[bullet.position.x, bullet.position.y, bullet.position.z]}
          >
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
          </mesh>
        ))}
      </Suspense>
    </Canvas>
  );
};

export default Game;
