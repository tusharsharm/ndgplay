import { type Game, type InsertGame, type Player, type InsertPlayer, type ChatMessage, type InsertChatMessage, type Vote, type InsertVote, games, players, chatMessages, votes } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Game operations
  createGame(game: InsertGame): Promise<Game>;
  getGame(id: string): Promise<Game | undefined>;
  getGameByRoomCode(roomCode: string): Promise<Game | undefined>;
  updateGame(id: string, updates: Partial<Game>): Promise<Game | undefined>;
  deleteGame(id: string): Promise<boolean>;

  // Player operations
  createPlayer(player: InsertPlayer): Promise<Player>;
  getPlayer(id: string): Promise<Player | undefined>;
  getPlayersByGameId(gameId: string): Promise<Player[]>;
  updatePlayer(id: string, updates: Partial<Player>): Promise<Player | undefined>;
  deletePlayer(id: string): Promise<boolean>;
  deletePlayersByGameId(gameId: string): Promise<boolean>;

  // Chat operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessagesByGameId(gameId: string): Promise<ChatMessage[]>;
  deleteChatMessagesByGameId(gameId: string): Promise<boolean>;

  // Vote operations
  createVote(vote: InsertVote): Promise<Vote>;
  getVotesByGameId(gameId: string): Promise<Vote[]>;
  deleteVotesByGameId(gameId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private games: Map<string, Game>;
  private players: Map<string, Player>;
  private chatMessages: Map<string, ChatMessage>;
  private votes: Map<string, Vote>;

  constructor() {
    this.games = new Map();
    this.players = new Map();
    this.chatMessages = new Map();
    this.votes = new Map();
  }

  // Game operations
  async createGame(insertGame: InsertGame): Promise<Game> {
    const id = randomUUID();
    const game: Game = {
      id,
      roomCode: insertGame.roomCode,
      hostId: insertGame.hostId,
      state: insertGame.state || "lobby",
      settings: insertGame.settings,
      createdAt: new Date(),
    };
    this.games.set(id, game);
    return game;
  }

  async getGame(id: string): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async getGameByRoomCode(roomCode: string): Promise<Game | undefined> {
    return Array.from(this.games.values()).find(game => game.roomCode === roomCode);
  }

  async updateGame(id: string, updates: Partial<Game>): Promise<Game | undefined> {
    const game = this.games.get(id);
    if (!game) return undefined;
    
    const updatedGame = { ...game, ...updates };
    this.games.set(id, updatedGame);
    return updatedGame;
  }

  async deleteGame(id: string): Promise<boolean> {
    return this.games.delete(id);
  }

  // Player operations
  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = randomUUID();
    const player: Player = {
      id,
      gameId: insertPlayer.gameId,
      username: insertPlayer.username,
      color: insertPlayer.color,
      role: insertPlayer.role || "crewmate",
      isAlive: insertPlayer.isAlive ?? true,
      isHost: insertPlayer.isHost ?? false,
      position: insertPlayer.position,
      tasksCompleted: insertPlayer.tasksCompleted ?? 0,
      totalTasks: insertPlayer.totalTasks ?? 7,
      hasVoted: insertPlayer.hasVoted ?? false,
      votedFor: insertPlayer.votedFor ?? null,
    };
    this.players.set(id, player);
    return player;
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async getPlayersByGameId(gameId: string): Promise<Player[]> {
    return Array.from(this.players.values()).filter(player => player.gameId === gameId);
  }

  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player | undefined> {
    const player = this.players.get(id);
    if (!player) return undefined;
    
    const updatedPlayer = { ...player, ...updates };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }

  async deletePlayer(id: string): Promise<boolean> {
    return this.players.delete(id);
  }

  async deletePlayersByGameId(gameId: string): Promise<boolean> {
    const playersToDelete = Array.from(this.players.values())
      .filter(player => player.gameId === gameId);
    
    playersToDelete.forEach(player => this.players.delete(player.id));
    return true;
  }

  // Chat operations
  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = {
      ...insertMessage,
      id,
      timestamp: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatMessagesByGameId(gameId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.gameId === gameId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async deleteChatMessagesByGameId(gameId: string): Promise<boolean> {
    const messagesToDelete = Array.from(this.chatMessages.values())
      .filter(message => message.gameId === gameId);
    
    messagesToDelete.forEach(message => this.chatMessages.delete(message.id));
    return true;
  }

  // Vote operations
  async createVote(insertVote: InsertVote): Promise<Vote> {
    const id = randomUUID();
    const vote: Vote = {
      id,
      gameId: insertVote.gameId,
      voterId: insertVote.voterId,
      targetId: insertVote.targetId ?? null,
      timestamp: new Date(),
    };
    this.votes.set(id, vote);
    return vote;
  }

  async getVotesByGameId(gameId: string): Promise<Vote[]> {
    return Array.from(this.votes.values()).filter(vote => vote.gameId === gameId);
  }

  async deleteVotesByGameId(gameId: string): Promise<boolean> {
    const votesToDelete = Array.from(this.votes.values())
      .filter(vote => vote.gameId === gameId);
    
    votesToDelete.forEach(vote => this.votes.delete(vote.id));
    return true;
  }
}

// Database Storage implementation
export class DatabaseStorage implements IStorage {
  async getGame(id: string): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game || undefined;
  }

  async getGameByRoomCode(roomCode: string): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.roomCode, roomCode));
    return game || undefined;
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const [game] = await db
      .insert(games)
      .values(insertGame)
      .returning();
    return game;
  }

  async updateGame(id: string, updates: Partial<Game>): Promise<Game | undefined> {
    const [game] = await db
      .update(games)
      .set(updates)
      .where(eq(games.id, id))
      .returning();
    return game || undefined;
  }

  async deleteGame(id: string): Promise<boolean> {
    const result = await db.delete(games).where(eq(games.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Player operations
  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const [player] = await db
      .insert(players)
      .values(insertPlayer)
      .returning();
    return player;
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || undefined;
  }

  async getPlayersByGameId(gameId: string): Promise<Player[]> {
    return await db.select().from(players).where(eq(players.gameId, gameId));
  }

  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player | undefined> {
    const [player] = await db
      .update(players)
      .set(updates)
      .where(eq(players.id, id))
      .returning();
    return player || undefined;
  }

  async deletePlayer(id: string): Promise<boolean> {
    const result = await db.delete(players).where(eq(players.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async deletePlayersByGameId(gameId: string): Promise<boolean> {
    const result = await db.delete(players).where(eq(players.gameId, gameId));
    return (result.rowCount ?? 0) >= 0;
  }

  // Chat operations
  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getChatMessagesByGameId(gameId: string): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).where(eq(chatMessages.gameId, gameId));
  }

  async deleteChatMessagesByGameId(gameId: string): Promise<boolean> {
    const result = await db.delete(chatMessages).where(eq(chatMessages.gameId, gameId));
    return (result.rowCount ?? 0) >= 0;
  }

  // Vote operations
  async createVote(insertVote: InsertVote): Promise<Vote> {
    const [vote] = await db
      .insert(votes)
      .values(insertVote)
      .returning();
    return vote;
  }

  async getVotesByGameId(gameId: string): Promise<Vote[]> {
    return await db.select().from(votes).where(eq(votes.gameId, gameId));
  }

  async deleteVotesByGameId(gameId: string): Promise<boolean> {
    const result = await db.delete(votes).where(eq(votes.gameId, gameId));
    return (result.rowCount ?? 0) >= 0;
  }
}

// Use database storage in production, memory storage in development
export const storage = process.env.NODE_ENV === 'production' 
  ? new DatabaseStorage() 
  : new MemStorage();
