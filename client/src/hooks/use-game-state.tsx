import { useState, useEffect } from "react";
import { type Game, type Player, type ChatMessage } from "@shared/schema";
import { useWebSocket } from "./use-websocket";

export function useGameState() {
  const { isConnected, lastMessage, sendMessage } = useWebSocket();
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  // Load current player from localStorage
  useEffect(() => {
    const savedPlayer = localStorage.getItem("currentPlayer");
    if (savedPlayer) {
      try {
        setCurrentPlayer(JSON.parse(savedPlayer));
      } catch (error) {
        console.error("Failed to parse saved player:", error);
      }
    }
  }, []);

  // Update game state when receiving WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      setGame(lastMessage.game);
      setPlayers(lastMessage.players);
      if (lastMessage.chatMessages) {
        setChatMessages(lastMessage.chatMessages);
      }

      // Update current player if it exists in the updated players list
      if (currentPlayer) {
        const updatedCurrentPlayer = lastMessage.players.find(p => p.id === currentPlayer.id);
        if (updatedCurrentPlayer) {
          setCurrentPlayer(updatedCurrentPlayer);
          localStorage.setItem("currentPlayer", JSON.stringify(updatedCurrentPlayer));
        }
      }
    }
  }, [lastMessage, currentPlayer]);

  const joinGame = (roomCode: string, username: string, color: string) => {
    sendMessage({
      type: "join_game",
      roomCode,
      username,
      color
    });
  };

  const leaveGame = () => {
    if (game && currentPlayer) {
      sendMessage({
        type: "leave_game",
        gameId: game.id,
        playerId: currentPlayer.id
      });
      setCurrentPlayer(null);
      localStorage.removeItem("currentPlayer");
    }
  };

  const startGame = () => {
    if (game) {
      sendMessage({
        type: "start_game",
        gameId: game.id
      });
    }
  };

  const movePlayer = (position: { x: number; y: number; room: string }) => {
    if (game && currentPlayer) {
      sendMessage({
        type: "player_move",
        gameId: game.id,
        playerId: currentPlayer.id,
        position
      });
    }
  };

  const completeTask = () => {
    if (game && currentPlayer) {
      sendMessage({
        type: "complete_task",
        gameId: game.id,
        playerId: currentPlayer.id
      });
    }
  };

  const emergencyMeeting = () => {
    if (game && currentPlayer) {
      sendMessage({
        type: "emergency_meeting",
        gameId: game.id,
        playerId: currentPlayer.id
      });
    }
  };

  const reportBody = (location: { x: number; y: number; room: string }) => {
    if (game && currentPlayer) {
      sendMessage({
        type: "report_body",
        gameId: game.id,
        playerId: currentPlayer.id,
        location
      });
    }
  };

  const sendChatMessage = (message: string) => {
    if (game && currentPlayer) {
      sendMessage({
        type: "chat_message",
        gameId: game.id,
        playerId: currentPlayer.id,
        message
      });
    }
  };

  const castVote = (targetId?: string) => {
    if (game && currentPlayer) {
      sendMessage({
        type: "cast_vote",
        gameId: game.id,
        playerId: currentPlayer.id,
        targetId
      });
    }
  };

  const killPlayer = (victimId: string) => {
    if (game && currentPlayer && currentPlayer.role === "impostor") {
      sendMessage({
        type: "kill_player",
        gameId: game.id,
        killerId: currentPlayer.id,
        victimId
      });
    }
  };

  return {
    isConnected,
    game,
    players,
    chatMessages,
    currentPlayer,
    setCurrentPlayer: (player: Player) => {
      setCurrentPlayer(player);
      localStorage.setItem("currentPlayer", JSON.stringify(player));
    },
    joinGame,
    leaveGame,
    startGame,
    movePlayer,
    completeTask,
    emergencyMeeting,
    reportBody,
    sendChatMessage,
    castVote,
    killPlayer,
  };
}
