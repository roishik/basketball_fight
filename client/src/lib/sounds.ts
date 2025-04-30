import { useAudio } from "./stores/useAudio";

// Audio elements
let backgroundMusic: HTMLAudioElement | null = null;
let hitSound: HTMLAudioElement | null = null;
let successSound: HTMLAudioElement | null = null;

/**
 * Loads and initializes all game sounds
 */
export function loadSounds() {
  // Create audio elements
  backgroundMusic = new Audio("/sounds/background.mp3");
  hitSound = new Audio("/sounds/hit.mp3");
  successSound = new Audio("/sounds/success.mp3");
  
  // Configure audio elements
  if (backgroundMusic) {
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;
  }
  
  if (hitSound) {
    hitSound.volume = 0.4;
  }
  
  if (successSound) {
    successSound.volume = 0.5;
  }
  
  // Store in zustand store
  const store = useAudio.getState();
  store.setBackgroundMusic(backgroundMusic);
  store.setHitSound(hitSound);
  store.setSuccessSound(successSound);
  
  // Try to start background music (will need user interaction to actually play)
  if (backgroundMusic) {
    backgroundMusic.play().catch(err => {
      console.log("Background music couldn't start automatically:", err);
      console.log("User interaction required to play audio");
    });
  }
  
  console.log("Game sounds loaded");
}

/**
 * Plays the hit sound effect
 */
export function playHitSound() {
  const { playHit } = useAudio.getState();
  playHit();
}

/**
 * Plays the score sound effect
 */
export function playScoreSound() {
  const { playSuccess } = useAudio.getState();
  playSuccess();
}

/**
 * Toggles background music
 */
export function toggleBackgroundMusic() {
  const { isMuted, toggleMute } = useAudio.getState();
  
  if (backgroundMusic) {
    if (isMuted) {
      backgroundMusic.play().catch(err => {
        console.log("Could not play background music:", err);
      });
    } else {
      backgroundMusic.pause();
    }
  }
  
  toggleMute();
}
