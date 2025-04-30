import { KeyboardControls } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import Game from "./components/Game";
import ScoreUI from "./components/ScoreUI";
import { Controls } from "./lib/constants";

// Define key mappings - WASD for movement, arrow keys for looking
const keyMap = [
  { name: Controls.forward, keys: ["KeyW"] },
  { name: Controls.backward, keys: ["KeyS"] },
  { name: Controls.left, keys: ["KeyA"] },
  { name: Controls.right, keys: ["KeyD"] },
  { name: Controls.turnLeft, keys: ["ArrowLeft"] },
  { name: Controls.turnRight, keys: ["ArrowRight"] },
  { name: Controls.lookUp, keys: ["ArrowUp"] },
  { name: Controls.lookDown, keys: ["ArrowDown"] },
  { name: Controls.action, keys: ["Space"] },
  { name: Controls.toggleGun, keys: ["KeyG"] },
  { name: Controls.reset, keys: ["KeyR"] },
  { name: Controls.pause, keys: ["Escape"] },
  { name: Controls.toggleMute, keys: ["KeyM"] }
];

// Main App component
function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Show the canvas once everything is loaded
  useEffect(() => {
    // Simple preloading simulation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <div className="text-2xl font-bold">Loading Basketball Game...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <KeyboardControls map={keyMap}>
        <Suspense fallback={null}>
          <Game />
        </Suspense>
        <ScoreUI />
      </KeyboardControls>
    </div>
  );
}

export default App;
