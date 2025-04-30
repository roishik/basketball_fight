// Game controls
export enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  turnLeft = 'turnLeft',
  turnRight = 'turnRight',
  lookUp = 'lookUp',       // Up arrow to look up
  lookDown = 'lookDown',   // Down arrow to look down
  action = 'action',       // Space bar for throwing or shooting
  toggleGun = 'toggleGun', // G key to switch weapons
  reset = 'reset',         // R key to restart
  pause = 'pause',         // Escape key to pause
  toggleMute = 'toggleMute' // M key to toggle sound
}

// Game physics constants
export const GRAVITY = 9.81; // m/s²
export const BALL_RADIUS = 0.12; // 12cm
export const BALL_MASS = 0.6; // 0.6kg
export const BALL_RESTITUTION = 0.75; // Bounciness
export const BALL_LINEAR_DAMPING = 0.05; // Air resistance

// Court dimensions
export const COURT_WIDTH = 20; // 20m
export const COURT_LENGTH = 12; // 12m

// Hoop parameters
export const HOOP_HEIGHT = 3; // 3m above ground
export const HOOP_RADIUS = 0.45; // 45cm

// Player parameters
export const PLAYER_MOVE_SPEED = 4; // 4 m/s
export const PLAYER_TURN_SPEED = 5; // 5 degrees per press

// Weapon parameters
export const BALL_MAX_CHARGE = 12; // Maximum throw velocity
export const BULLET_SPEED = 35; // 35 m/s
export const BULLET_LIFETIME = 2; // 2 seconds
export const BULLET_MASS = 0.05; // 0.05kg
