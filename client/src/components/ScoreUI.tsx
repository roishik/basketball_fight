import { useState, useEffect } from "react";
import { useBasketballGame } from "../lib/stores/useBasketballGame";
import { useAudio } from "../lib/stores/useAudio";
import { cn } from "../lib/utils";

const ScoreUI = () => {
  const { 
    playerScore, 
    botScores, 
    currentWeapon, 
    gamePhase, 
    startGame,
    resetGame,
    remainingTime 
  } = useBasketballGame();
  
  const { isMuted } = useAudio();
  const [showControls, setShowControls] = useState(true);
  
  // Show controls for first 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Format remaining time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Determine winner
  const determineWinner = () => {
    const botLScore = botScores['Bot L'] || 0;
    const botRScore = botScores['Bot R'] || 0;
    
    if (playerScore > botLScore && playerScore > botRScore) {
      return 'You Win!';
    } else if (botLScore > playerScore && botLScore > botRScore) {
      return 'Bot L Wins!';
    } else if (botRScore > playerScore && botRScore > botLScore) {
      return 'Bot R Wins!';
    } else {
      return 'Draw!';
    }
  };
  
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Crosshair */}
      <div className="absolute left-1/2 top-1/2 w-1 h-1 bg-white -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
      
      {/* Scoreboard */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 px-6 py-2 rounded-md text-white text-center">
        <div className="flex justify-between gap-8 text-xl font-bold">
          <span>You: {playerScore}</span>
          <span>Bot L: {botScores['Bot L'] || 0}</span>
          <span>Bot R: {botScores['Bot R'] || 0}</span>
        </div>
      </div>
      
      {/* Timer */}
      <div className={cn(
        "absolute top-4 right-4 px-4 py-2 rounded-md text-white font-mono text-2xl bg-black/50", 
        remainingTime <= 10 ? "animate-pulse text-red-500" : ""
      )}>
        {formatTime(remainingTime)}
      </div>
      
      {/* Mode indicator */}
      <div className="absolute bottom-4 right-4 px-4 py-2 rounded-md bg-black/50 text-white text-center">
        <div className="text-2xl">
          {currentWeapon === 'ball' ? '🏀' : '🔫'}
        </div>
        <div className="text-xs mt-1">
          {currentWeapon === 'ball' ? 'Basketball' : 'Plasma Gun'}
        </div>
      </div>
      
      {/* Controls hint */}
      {showControls && (
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 bg-black/70 p-4 rounded-md text-white text-center max-w-md">
          <h3 className="text-lg font-bold mb-2">Controls</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-left">WASD / Arrow Keys</div>
            <div className="text-left">Move and turn</div>
            <div className="text-left">Space</div>
            <div className="text-left">Throw ball / fire gun</div>
            <div className="text-left">G</div>
            <div className="text-left">Switch weapon</div>
            <div className="text-left">M</div>
            <div className="text-left">Toggle sound</div>
            <div className="text-left">R</div>
            <div className="text-left">Reset after match</div>
          </div>
        </div>
      )}
      
      {/* Sound status indicator */}
      <div className="absolute bottom-4 left-4 px-3 py-2 rounded-md bg-black/50 text-white text-center">
        <div className="text-xl">
          {isMuted ? '🔇' : '🔊'}
        </div>
        <div className="text-xs mt-1">
          Sound {isMuted ? 'Off' : 'On'}
        </div>
      </div>
      
      {/* Game Over screen */}
      {gamePhase === 'ended' && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white pointer-events-auto">
          <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
          <h3 className="text-3xl mb-6">{determineWinner()}</h3>
          
          <div className="text-xl mb-6">
            <div className="flex justify-between gap-8">
              <span>You: {playerScore}</span>
              <span>Bot L: {botScores['Bot L'] || 0}</span>
              <span>Bot R: {botScores['Bot R'] || 0}</span>
            </div>
          </div>
          
          <button 
            className="bg-blue-600 px-6 py-3 rounded-md text-white text-xl hover:bg-blue-700 transition-colors"
            onClick={() => resetGame()}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default ScoreUI;
