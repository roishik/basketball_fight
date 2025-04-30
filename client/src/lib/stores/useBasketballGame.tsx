import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { nanoid } from "nanoid";
import { checkBallInHoop, detectCollision } from "../physics";
import { playHitSound, playScoreSound } from "../sounds";

export type GamePhase = "ready" | "playing" | "ended";
export type Weapon = "ball" | "gun";

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Velocity {
  x: number;
  y: number;
  z: number;
}

export interface AABB {
  min: Position;
  max: Position;
}

export interface Basketball {
  id: string;
  position: Position;
  velocity: Velocity;
  owner: string;  // 'player' or bot id
  createdAt: number;
  exploding?: boolean; // Flag for explosion animation
  explosionStartTime?: number; // When explosion started
}

export interface Bullet {
  id: string;
  position: Position;
  direction: Position;
  createdAt: number;
}

export interface Bot {
  id: string;
  position: Position;
}

export interface BasketballGameState {
  gamePhase: GamePhase;
  playerPosition: Position;
  playerRotation: number;
  hoopPosition: Position;
  currentWeapon: Weapon;
  isCharging: boolean;
  basketballs: Basketball[];
  bullets: Bullet[];
  bots: Bot[];
  boundaries: AABB[];
  playerScore: number;
  botScores: Record<string, number>;
  remainingTime: number;
  
  // Game actions
  initGame: () => void;
  startGame: () => void;
  resetGame: () => void;
  endGame: () => void;
  
  // Player actions
  updatePlayerPosition: (position: Position) => void;
  updatePlayerRotation: (rotation: number) => void;
  toggleWeapon: () => void;
  startCharging: () => void;
  releaseCharge: () => void;
  throwBall: (params: { position: Position; velocity: Velocity }) => void;
  throwBotBall: (params: { position: Position; velocity: Velocity; owner: string }) => void;
  shootGun: (params: { position: Position; direction: Position }) => void;
  
  // Game setup
  setHoopPosition: (position: Position) => void;
  addBot: (bot: Bot) => void;
  addBoundary: (boundary: AABB) => void;
  
  // Scoring
  addScore: (player: string) => void;
}

export const useBasketballGame = create<BasketballGameState>()(
  subscribeWithSelector((set, get) => {
    // Game loop interval
    let gameLoopInterval: number | null = null;
    let gameTimerInterval: number | null = null;
    
    return {
      gamePhase: "ready",
      playerPosition: { x: 0, y: 1.6, z: 0 },
      playerRotation: Math.PI, // Facing the hoop (-z direction)
      hoopPosition: { x: 0, y: 3, z: -9 },
      currentWeapon: "ball",
      isCharging: false,
      basketballs: [],
      bullets: [],
      bots: [],
      boundaries: [],
      playerScore: 0,
      botScores: {},
      remainingTime: 300, // 5 minute timer (300 seconds)
      
      initGame: () => {
        console.log("Initializing basketball game");
        set({
          gamePhase: "ready",
          playerPosition: { x: 0, y: 1.6, z: 0 },
          playerRotation: Math.PI,
          currentWeapon: "ball",
          isCharging: false,
          basketballs: [],
          bullets: [],
          playerScore: 0,
          botScores: {},
          remainingTime: 90
        });
      },
      
      startGame: () => {
        console.log("Starting basketball game");
        
        // Only transition from ready to playing
        if (get().gamePhase !== "ready") return;
        
        set({ gamePhase: "playing" });
        
        // Start game loop
        if (gameLoopInterval) clearInterval(gameLoopInterval);
        gameLoopInterval = window.setInterval(() => {
          const { 
            basketballs, 
            bullets, 
            hoopPosition,
            boundaries
          } = get();
          
          // Update basketballs (physics)
          const updatedBasketballs = [...basketballs];
          const newBasketballs = [];
          
          for (const ball of updatedBasketballs) {
            // Apply gravity (9.81 m/s²)
            const newVelocity = {
              x: ball.velocity.x * 0.995, // Linear damping
              y: ball.velocity.y - 9.81 * (1/60), // Gravity
              z: ball.velocity.z * 0.995 // Linear damping
            };
            
            // Update position
            const newPosition = {
              x: ball.position.x + newVelocity.x * (1/60),
              y: ball.position.y + newVelocity.y * (1/60),
              z: ball.position.z + newVelocity.z * (1/60)
            };
            
            // Check collisions with boundaries
            let collided = false;
            
            // Check for floor collision
            if (newPosition.y <= 0.12) { // Ball radius is 0.12m
              newPosition.y = 0.12;
              newVelocity.y = -newVelocity.y * 0.75; // Bounce with restitution
              
              // If it's barely moving after bouncing, stop it
              if (Math.abs(newVelocity.y) < 0.5) {
                newVelocity.y = 0;
              }
              
              collided = true;
            }
            
            // Check for wall collisions
            for (const boundary of boundaries) {
              if (
                newPosition.x >= boundary.min.x && newPosition.x <= boundary.max.x &&
                newPosition.y >= boundary.min.y && newPosition.y <= boundary.max.y &&
                newPosition.z >= boundary.min.z && newPosition.z <= boundary.max.z
              ) {
                // Determine which face of the boundary we hit
                const xOverlap = Math.min(
                  Math.abs(newPosition.x - boundary.min.x),
                  Math.abs(newPosition.x - boundary.max.x)
                );
                const yOverlap = Math.min(
                  Math.abs(newPosition.y - boundary.min.y),
                  Math.abs(newPosition.y - boundary.max.y)
                );
                const zOverlap = Math.min(
                  Math.abs(newPosition.z - boundary.min.z),
                  Math.abs(newPosition.z - boundary.max.z)
                );
                
                // Find the minimum overlap
                if (xOverlap <= yOverlap && xOverlap <= zOverlap) {
                  // X-axis collision
                  newVelocity.x = -newVelocity.x * 0.75;
                  if (newPosition.x < (boundary.min.x + boundary.max.x) / 2) {
                    newPosition.x = boundary.min.x - 0.12;
                  } else {
                    newPosition.x = boundary.max.x + 0.12;
                  }
                } else if (yOverlap <= xOverlap && yOverlap <= zOverlap) {
                  // Y-axis collision
                  newVelocity.y = -newVelocity.y * 0.75;
                  if (newPosition.y < (boundary.min.y + boundary.max.y) / 2) {
                    newPosition.y = boundary.min.y - 0.12;
                  } else {
                    newPosition.y = boundary.max.y + 0.12;
                  }
                } else {
                  // Z-axis collision
                  newVelocity.z = -newVelocity.z * 0.75;
                  if (newPosition.z < (boundary.min.z + boundary.max.z) / 2) {
                    newPosition.z = boundary.min.z - 0.12;
                  } else {
                    newPosition.z = boundary.max.z + 0.12;
                  }
                }
                
                collided = true;
                break;
              }
            }
            
            // Check if the ball went through the hoop
            if (checkBallInHoop(ball.position, newPosition, hoopPosition)) {
              console.log(`Basket scored by ${ball.owner}!`);
              get().addScore(ball.owner);
              playScoreSound();
              continue; // Remove the ball
            }
            
            // Check if the ball is exploding
            if (ball.exploding) {
              const explosionDuration = 0.5; // 0.5 seconds for explosion effect
              const explosionTime = (Date.now() - (ball.explosionStartTime || 0)) / 1000;
              
              if (explosionTime > explosionDuration) {
                // Explosion completed, remove the ball
                continue;
              }
              
              // Keep the exploding ball for the animation
              newBasketballs.push({
                ...ball
              });
              continue;
            }
            
            // Check if the ball has been on court for too long (10 seconds)
            const lifespan = (Date.now() - ball.createdAt) / 1000;
            if (lifespan > 10) {
              continue; // Remove old balls
            }
            
            // Check if the ball is out of bounds (fell off court)
            if (newPosition.y < -5 || 
                newPosition.x < -15 || newPosition.x > 15 ||
                newPosition.z < -15 || newPosition.z > 5) {
              continue; // Remove the ball
            }
            
            // Update the ball with new position and velocity
            newBasketballs.push({
              ...ball,
              position: newPosition,
              velocity: newVelocity
            });
          }
          
          // Update bullets
          const updatedBullets = [...bullets];
          const newBullets = [];
          
          for (const bullet of updatedBullets) {
            // Update position based on normalized direction vector
            const speed = 35; // 35 m/s
            const newPosition = {
              x: bullet.position.x + bullet.direction.x * speed * (1/60),
              y: bullet.position.y + bullet.direction.y * speed * (1/60),
              z: bullet.position.z + bullet.direction.z * speed * (1/60)
            };
            
            // Check for collisions with basketballs
            let hitBall = false;
            
            for (let i = 0; i < newBasketballs.length; i++) {
              const ball: Basketball = newBasketballs[i];
              
              if (detectCollision(bullet.position, newPosition, ball.position, 0.05, 0.12)) {
                console.log(`Bullet hit basketball ${ball.id}!`);
                
                // Instead of immediately removing, mark for explosion
                newBasketballs[i] = {
                  ...ball,
                  exploding: true,
                  explosionStartTime: Date.now()
                };
                
                // Don't keep the bullet
                hitBall = true;
                
                // Play hit sound
                playHitSound();
                
                break;
              }
            }
            
            if (hitBall) continue;
            
            // Check if the bullet has been in flight for too long (2 seconds)
            const lifespan = (Date.now() - bullet.createdAt) / 1000;
            if (lifespan > 2) {
              continue; // Remove old bullets
            }
            
            // Check if bullet is out of bounds
            if (newPosition.y < -5 || newPosition.y > 10 ||
                newPosition.x < -15 || newPosition.x > 15 ||
                newPosition.z < -15 || newPosition.z > 5) {
              continue; // Remove the bullet
            }
            
            // Keep the bullet
            newBullets.push({
              ...bullet,
              position: newPosition
            });
          }
          
          // Update state with new basketballs and bullets
          set({
            basketballs: newBasketballs,
            bullets: newBullets
          });
        }, 1000 / 60); // 60 FPS
        
        // Start game timer
        if (gameTimerInterval) clearInterval(gameTimerInterval);
        gameTimerInterval = window.setInterval(() => {
          const { remainingTime } = get();
          
          if (remainingTime <= 0) {
            get().endGame();
            return;
          }
          
          set({ remainingTime: remainingTime - 1 });
        }, 1000);
      },
      
      resetGame: () => {
        console.log("Resetting basketball game");
        
        // Clear intervals
        if (gameLoopInterval) {
          clearInterval(gameLoopInterval);
          gameLoopInterval = null;
        }
        
        if (gameTimerInterval) {
          clearInterval(gameTimerInterval);
          gameTimerInterval = null;
        }
        
        // Reset game state
        set({
          gamePhase: "ready",
          playerPosition: { x: 0, y: 1.6, z: 0 },
          playerRotation: Math.PI,
          currentWeapon: "ball",
          isCharging: false,
          basketballs: [],
          bullets: [],
          playerScore: 0,
          botScores: {},
          remainingTime: 90
        });
        
        // Restart the game
        setTimeout(() => {
          get().startGame();
        }, 1000);
      },
      
      endGame: () => {
        console.log("Ending basketball game");
        
        // Only transition from playing to ended
        if (get().gamePhase !== "playing") return;
        
        // Clear intervals
        if (gameLoopInterval) {
          clearInterval(gameLoopInterval);
          gameLoopInterval = null;
        }
        
        if (gameTimerInterval) {
          clearInterval(gameTimerInterval);
          gameTimerInterval = null;
        }
        
        set({ gamePhase: "ended" });
      },
      
      updatePlayerPosition: (position) => {
        set({ playerPosition: position });
      },
      
      updatePlayerRotation: (rotation) => {
        set({ playerRotation: rotation });
      },
      
      toggleWeapon: () => {
        const { currentWeapon } = get();
        set({ currentWeapon: currentWeapon === "ball" ? "gun" : "ball" });
        console.log(`Switched to ${currentWeapon === "ball" ? "gun" : "ball"}`);
      },
      
      startCharging: () => {
        set({ isCharging: true });
      },
      
      releaseCharge: () => {
        set({ isCharging: false });
      },
      
      throwBall: ({ position, velocity }) => {
        const { basketballs } = get();
        
        // Add a new basketball
        set({
          basketballs: [
            ...basketballs,
            {
              id: nanoid(),
              position,
              velocity,
              owner: 'player',
              createdAt: Date.now()
            }
          ]
        });
      },
      
      throwBotBall: ({ position, velocity, owner }) => {
        const { basketballs } = get();
        
        // Add a new basketball from a bot
        set({
          basketballs: [
            ...basketballs,
            {
              id: nanoid(),
              position,
              velocity,
              owner,
              createdAt: Date.now()
            }
          ]
        });
      },
      
      shootGun: ({ position, direction }) => {
        const { bullets } = get();
        
        // Add a new bullet
        set({
          bullets: [
            ...bullets,
            {
              id: nanoid(),
              position,
              direction,
              createdAt: Date.now()
            }
          ]
        });
      },
      
      setHoopPosition: (position) => {
        set({ hoopPosition: position });
      },
      
      addBot: (bot) => {
        const { bots, botScores } = get();
        
        // Initialize bot score
        const updatedBotScores = { ...botScores };
        updatedBotScores[bot.id] = 0;
        
        set({
          bots: [...bots, bot],
          botScores: updatedBotScores
        });
      },
      
      addBoundary: (boundary) => {
        const { boundaries } = get();
        set({ boundaries: [...boundaries, boundary] });
      },
      
      addScore: (player) => {
        if (player === 'player') {
          set(state => ({ playerScore: state.playerScore + 1 }));
        } else {
          set(state => ({
            botScores: {
              ...state.botScores,
              [player]: (state.botScores[player] || 0) + 1
            }
          }));
        }
        
        console.log(`Score updated for ${player}`);
      }
    };
  })
);
