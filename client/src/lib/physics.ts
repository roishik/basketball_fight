import { Position } from "./stores/useBasketballGame";

/**
 * Checks if a ball has passed through the hoop cylinder
 */
export function checkBallInHoop(
  prevPosition: Position,
  currentPosition: Position,
  hoopPosition: Position
): boolean {
  // Parameters
  const hoopRadius = 0.45; // 45cm
  const hoopHeight = hoopPosition.y; // 3m above ground
  const ballRadius = 0.12; // 12cm
  
  // First, check if the ball is near the hoop in the xz-plane
  const ballDistanceXZ = Math.sqrt(
    Math.pow(currentPosition.x - hoopPosition.x, 2) +
    Math.pow(currentPosition.z - hoopPosition.z, 2)
  );
  
  // Ball must be within the hoop radius (minus ball radius to ensure it's fully inside)
  if (ballDistanceXZ > hoopRadius - ballRadius) {
    return false;
  }
  
  // Check if the ball has crossed the hoop plane
  const prevY = prevPosition.y;
  const currY = currentPosition.y;
  
  // Ball must cross the hoop plane from top to bottom
  if (prevY >= hoopHeight && currY < hoopHeight) {
    return true;
  }
  
  return false;
}

/**
 * Detects collision between a bullet and a ball
 */
export function detectCollision(
  bulletPos: Position,
  newBulletPos: Position,
  ballPos: Position,
  bulletRadius: number,
  ballRadius: number
): boolean {
  // Calculate distance between bullet and ball centers
  const distance = Math.sqrt(
    Math.pow(newBulletPos.x - ballPos.x, 2) +
    Math.pow(newBulletPos.y - ballPos.y, 2) +
    Math.pow(newBulletPos.z - ballPos.z, 2)
  );
  
  // If distance is less than sum of radii, there is a collision
  return distance < (bulletRadius + ballRadius);
}
