import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { type WebSocketMessage, type GameStateUpdate, PLAYER_COLORS, ROOMS } from "@shared/schema";

interface GameSession {
  gameId: string;
  playerId: string;
  socket: WebSocket;
}

const activeSessions: Map<string, GameSession> = new Map();

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function assignRoles(playerIds: string[], impostorCount: number): Map<string, "crewmate" | "impostor"> {
  const roles = new Map<string, "crewmate" | "impostor">();
  const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
  
  shuffled.forEach((playerId, index) => {
    roles.set(playerId, index < impostorCount ? "impostor" : "crewmate");
  });
  
  return roles;
}

async function broadcastGameState(gameId: string) {
  const game = await storage.getGame(gameId);
  const players = await storage.getPlayersByGameId(gameId);
  const chatMessages = await storage.getChatMessagesByGameId(gameId);
  
  if (!game) return;

  const update: GameStateUpdate = {
    type: "game_state_update",
    game,
    players,
    chatMessages,
  };

  // Broadcast to all players in the game
  activeSessions.forEach((session) => {
    if (session.gameId === gameId && session.socket.readyState === WebSocket.OPEN) {
      session.socket.send(JSON.stringify(update));
    }
  });
}

async function checkWinConditions(gameId: string) {
  const game = await storage.getGame(gameId);
  const players = await storage.getPlayersByGameId(gameId);
  
  if (!game || game.state !== "playing") return;

  const alivePlayers = players.filter(p => p.isAlive);
  const aliveCrewmates = alivePlayers.filter(p => p.role === "crewmate");
  const aliveImpostors = alivePlayers.filter(p => p.role === "impostor");

  // Check impostor win condition
  if (aliveImpostors.length >= aliveCrewmates.length) {
    await storage.updateGame(gameId, { state: "ended" });
    await broadcastGameState(gameId);
    return;
  }

  // Check crewmate win condition (no impostors left)
  if (aliveImpostors.length === 0) {
    await storage.updateGame(gameId, { state: "ended" });
    await broadcastGameState(gameId);
    return;
  }

  // Check task completion win condition
  const totalTasks = aliveCrewmates.reduce((sum, p) => sum + p.totalTasks, 0);
  const completedTasks = aliveCrewmates.reduce((sum, p) => sum + p.tasksCompleted, 0);
  
  if (totalTasks > 0 && completedTasks >= totalTasks) {
    await storage.updateGame(gameId, { state: "ended" });
    await broadcastGameState(gameId);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    let sessionId = '';

    ws.on('message', async (data) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());

        switch (message.type) {
          case "join_game": {
            const { roomCode, username, color } = message;
            
            // Find or create game
            let game = await storage.getGameByRoomCode(roomCode);
            if (!game) {
              // Create new game
              game = await storage.createGame({
                roomCode,
                hostId: '', // Will be set to first player
                state: "lobby",
                settings: {
                  impostors: 2,
                  discussionTime: 45,
                  votingTime: 120,
                  anonymousVotes: true
                }
              });
            }

            if (game.state !== "lobby") {
              ws.send(JSON.stringify({ type: "error", message: "Game already in progress" }));
              return;
            }

            const existingPlayers = await storage.getPlayersByGameId(game.id);
            if (existingPlayers.length >= 10) {
              ws.send(JSON.stringify({ type: "error", message: "Game is full" }));
              return;
            }

            // Check if color is taken
            if (existingPlayers.some(p => p.color === color)) {
              ws.send(JSON.stringify({ type: "error", message: "Color already taken" }));
              return;
            }

            // Create player
            const player = await storage.createPlayer({
              gameId: game.id,
              username,
              color,
              role: "crewmate",
              isAlive: true,
              isHost: existingPlayers.length === 0,
              position: { x: 300, y: 300, room: "central" },
              tasksCompleted: 0,
              totalTasks: 7,
              hasVoted: false,
              votedFor: null,
            });

            // Update host if this is the first player
            if (existingPlayers.length === 0) {
              await storage.updateGame(game.id, { hostId: player.id });
            }

            // Store session
            sessionId = `${game.id}-${player.id}`;
            activeSessions.set(sessionId, {
              gameId: game.id,
              playerId: player.id,
              socket: ws
            });

            await broadcastGameState(game.id);
            break;
          }

          case "leave_game": {
            const { gameId, playerId } = message;
            
            // Remove player
            await storage.deletePlayer(playerId);
            
            // Remove session
            activeSessions.delete(sessionId);
            
            // Check if host left
            const game = await storage.getGame(gameId);
            const remainingPlayers = await storage.getPlayersByGameId(gameId);
            
            if (game && game.hostId === playerId && remainingPlayers.length > 0) {
              // Transfer host to another player
              await storage.updateGame(gameId, { hostId: remainingPlayers[0].id });
              await storage.updatePlayer(remainingPlayers[0].id, { isHost: true });
            }

            if (remainingPlayers.length === 0) {
              // Delete empty game
              await storage.deleteGame(gameId);
              await storage.deleteChatMessagesByGameId(gameId);
              await storage.deleteVotesByGameId(gameId);
            } else {
              await broadcastGameState(gameId);
            }
            break;
          }

          case "start_game": {
            const { gameId } = message;
            const game = await storage.getGame(gameId);
            const players = await storage.getPlayersByGameId(gameId);
            
            if (!game || game.state !== "lobby" || players.length < 4) {
              ws.send(JSON.stringify({ type: "error", message: "Cannot start game" }));
              return;
            }

            // Assign roles
            const settings = game.settings as any;
            const roles = assignRoles(players.map(p => p.id), settings.impostors);
            
            // Update player roles
            for (const player of players) {
              await storage.updatePlayer(player.id, { 
                role: roles.get(player.id),
                hasVoted: false,
                votedFor: null
              });
            }

            // Update game state
            await storage.updateGame(gameId, { state: "playing" });
            await broadcastGameState(gameId);
            break;
          }

          case "player_move": {
            const { gameId, playerId, position } = message;
            await storage.updatePlayer(playerId, { position });
            await broadcastGameState(gameId);
            break;
          }

          case "complete_task": {
            const { gameId, playerId } = message;
            const player = await storage.getPlayer(playerId);
            
            if (player && player.tasksCompleted < player.totalTasks) {
              await storage.updatePlayer(playerId, { 
                tasksCompleted: player.tasksCompleted + 1 
              });
              await broadcastGameState(gameId);
              await checkWinConditions(gameId);
            }
            break;
          }

          case "emergency_meeting": {
            const { gameId } = message;
            await storage.updateGame(gameId, { state: "voting" });
            
            // Reset all votes
            const players = await storage.getPlayersByGameId(gameId);
            for (const player of players) {
              await storage.updatePlayer(player.id, { hasVoted: false, votedFor: null });
            }
            
            await storage.deleteVotesByGameId(gameId);
            await broadcastGameState(gameId);
            break;
          }

          case "report_body": {
            const { gameId } = message;
            await storage.updateGame(gameId, { state: "voting" });
            
            // Reset all votes
            const players = await storage.getPlayersByGameId(gameId);
            for (const player of players) {
              await storage.updatePlayer(player.id, { hasVoted: false, votedFor: null });
            }
            
            await storage.deleteVotesByGameId(gameId);
            await broadcastGameState(gameId);
            break;
          }

          case "chat_message": {
            const { gameId, playerId, message: chatMessage } = message;
            await storage.createChatMessage({
              gameId,
              playerId,
              message: chatMessage
            });
            await broadcastGameState(gameId);
            break;
          }

          case "cast_vote": {
            const { gameId, playerId, targetId } = message;
            
            // Check if player already voted
            const player = await storage.getPlayer(playerId);
            if (player?.hasVoted) return;
            
            // Record vote
            await storage.createVote({
              gameId,
              voterId: playerId,
              targetId: targetId || null
            });
            
            await storage.updatePlayer(playerId, { 
              hasVoted: true, 
              votedFor: targetId || null 
            });

            // Check if all players have voted
            const players = await storage.getPlayersByGameId(gameId);
            const alivePlayers = players.filter(p => p.isAlive);
            const votedPlayers = alivePlayers.filter(p => p.hasVoted);
            
            if (votedPlayers.length === alivePlayers.length) {
              // Tally votes and eliminate player
              const votes = await storage.getVotesByGameId(gameId);
              const voteCounts = new Map<string, number>();
              
              votes.forEach(vote => {
                if (vote.targetId) {
                  voteCounts.set(vote.targetId, (voteCounts.get(vote.targetId) || 0) + 1);
                }
              });
              
              // Find player with most votes
              let maxVotes = 0;
              let eliminatedPlayerId = '';
              let tie = false;
              
              voteCounts.forEach((count, playerId) => {
                if (count > maxVotes) {
                  maxVotes = count;
                  eliminatedPlayerId = playerId;
                  tie = false;
                } else if (count === maxVotes && maxVotes > 0) {
                  tie = true;
                }
              });
              
              // Eliminate player if not a tie
              if (!tie && eliminatedPlayerId) {
                await storage.updatePlayer(eliminatedPlayerId, { isAlive: false });
              }
              
              // Return to playing state
              await storage.updateGame(gameId, { state: "playing" });
              await broadcastGameState(gameId);
              await checkWinConditions(gameId);
            } else {
              await broadcastGameState(gameId);
            }
            break;
          }

          case "kill_player": {
            const { gameId, killerId, victimId } = message;
            const killer = await storage.getPlayer(killerId);
            
            if (killer?.role === "impostor") {
              await storage.updatePlayer(victimId, { isAlive: false });
              await broadcastGameState(gameId);
              await checkWinConditions(gameId);
            }
            break;
          }

          case "sabotage": {
            const { gameId } = message;
            // Basic sabotage implementation - could be expanded
            await broadcastGameState(gameId);
            break;
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
      }
    });

    ws.on('close', () => {
      // Clean up session
      if (sessionId) {
        const session = activeSessions.get(sessionId);
        if (session) {
          // Handle player leaving
          storage.deletePlayer(session.playerId);
          activeSessions.delete(sessionId);
          broadcastGameState(session.gameId);
        }
      }
    });
  });

  return httpServer;
}
