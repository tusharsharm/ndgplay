import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomCode: varchar("room_code", { length: 6 }).notNull().unique(),
  hostId: varchar("host_id").notNull(),
  state: varchar("state").notNull().default("lobby"), // lobby, playing, voting, results, ended
  settings: jsonb("settings").notNull().default({
    impostors: 2,
    discussionTime: 45,
    votingTime: 120,
    anonymousVotes: true
  }),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull(),
  username: text("username").notNull(),
  color: varchar("color").notNull(),
  role: varchar("role").default("crewmate"), // crewmate, impostor
  isAlive: boolean("is_alive").notNull().default(true),
  isHost: boolean("is_host").notNull().default(false),
  position: jsonb("position").notNull().default({ x: 300, y: 300, room: "central" }),
  tasksCompleted: integer("tasks_completed").notNull().default(0),
  totalTasks: integer("total_tasks").notNull().default(7),
  hasVoted: boolean("has_voted").notNull().default(false),
  votedFor: varchar("voted_for"),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull(),
  playerId: varchar("player_id").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
});

export const votes = pgTable("votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull(),
  voterId: varchar("voter_id").notNull(),
  targetId: varchar("target_id"), // null for skip vote
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  timestamp: true,
});

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;

// WebSocket message types
export type WebSocketMessage = 
  | { type: "join_game"; roomCode: string; username: string; color: string }
  | { type: "leave_game"; gameId: string; playerId: string }
  | { type: "start_game"; gameId: string }
  | { type: "player_move"; gameId: string; playerId: string; position: { x: number; y: number; room: string } }
  | { type: "complete_task"; gameId: string; playerId: string }
  | { type: "emergency_meeting"; gameId: string; playerId: string }
  | { type: "report_body"; gameId: string; playerId: string; location: { x: number; y: number; room: string } }
  | { type: "chat_message"; gameId: string; playerId: string; message: string }
  | { type: "cast_vote"; gameId: string; playerId: string; targetId?: string }
  | { type: "kill_player"; gameId: string; killerId: string; victimId: string }
  | { type: "sabotage"; gameId: string; playerId: string; sabotageType: string };

export type GameStateUpdate = {
  type: "game_state_update";
  game: Game;
  players: Player[];
  chatMessages?: ChatMessage[];
};

export type PlayerColors = [
  "red", "blue", "green", "yellow", "purple", "pink", 
  "orange", "white", "black", "brown"
];

export const PLAYER_COLORS: PlayerColors = [
  "red", "blue", "green", "yellow", "purple", "pink", 
  "orange", "white", "black", "brown"
];

export const ROOMS = [
  { id: "cafeteria", name: "Cafeteria", x: 100, y: 100, width: 120, height: 80 },
  { id: "medbay", name: "Medbay", x: 400, y: 100, width: 120, height: 80 },
  { id: "electrical", name: "Electrical", x: 100, y: 400, width: 120, height: 80 },
  { id: "reactor", name: "Reactor", x: 400, y: 400, width: 120, height: 80 },
  { id: "central", name: "Central Hub", x: 225, y: 225, width: 150, height: 100 },
];
