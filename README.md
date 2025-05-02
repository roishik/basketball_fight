# First-Person Basketball Game

## Overview
A dynamic first-person basketball game that combines shooting mechanics with physics-based ball throwing and plasma gun interactions. This browser-based game uses React and Three.js to create an immersive 3D experience where players can throw basketballs and shoot plasma guns to score points.

## Features
- First-person movement and aiming
- Physics-based basketball throwing with realistic trajectories
- Plasma gun that can shoot exploding projectiles
- Basketball explosion effects when hit by plasma
- Scoring system and timer
- Background music and sound effects
- Bot players for competition

## Controls

### Movement
- **W**: Move forward
- **S**: Move backward
- **A**: Strafe left
- **D**: Strafe right

### Aiming & Looking
- **Left Arrow**: Turn left
- **Right Arrow**: Turn right
- **Up Arrow**: Look up (affects throw trajectory)
- **Down Arrow**: Look down (affects throw trajectory)

### Actions
- **Space**: Hold to charge and release to throw the basketball (longer hold = stronger throw)
- **G**: Toggle between basketball and plasma gun
- **M**: Toggle sound mute/unmute

## Game Mechanics

### Basketball Throwing
- Hold space to charge your throw
- The charge indicator shows the strength of your throw (yellow → green → red)
- Release space to throw the ball
- Looking up/down changes the vertical trajectory of your throw
- Throws have added upward momentum for a more realistic arc

### Plasma Gun
- Press G to switch to the plasma gun
- Press space to fire a plasma bullet
- If a plasma bullet hits a basketball, the ball will explode

### Scoring
- Each basket counts as 1 point
- Game lasts for 5 minutes (300 seconds)
- Try to score more points than the bot players

## Technical Implementation
- Built with React and Three.js (via React Three Fiber)
- Uses Zustand for state management
- Physics simulation for ball movement and collisions
- Integrated audio system with background music and sound effects

## How to Play
1. Click on the game screen to focus
2. Use WASD to move around the court
3. Use arrow keys to aim and adjust your view
4. Hold and release space to throw the basketball
5. Try to score as many baskets as possible before time runs out

## Development
This project was built using:
- React for UI components
- React Three Fiber for 3D rendering
- Zustand for state management
- Express for the backend server

To start the development server, run:
```bash
npm run dev
```
