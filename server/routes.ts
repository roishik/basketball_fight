import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.get('/api/ping', (req, res) => {
    res.json({ 
      status: 'ok', 
      message: 'Basketball Game API is running', 
      timestamp: new Date().toISOString() 
    });
  });

  // Highscores API
  app.get('/api/highscores', (req, res) => {
    res.json({
      scores: [
        { player: 'Player', score: 10 },
        { player: 'Bot L', score: 8 },
        { player: 'Bot R', score: 7 }
      ]
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
