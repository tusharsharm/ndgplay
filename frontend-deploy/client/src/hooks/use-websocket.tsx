import { useEffect, useRef, useState } from "react";
import { type WebSocketMessage, type GameStateUpdate } from "@shared/schema";

export function useWebSocket() {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<GameStateUpdate | null>(null);

  useEffect(() => {
    const getWebSocketUrl = () => {
      // Production environment - use environment variable
      if (import.meta.env.PROD) {
        return import.meta.env.VITE_WS_URL || 'wss://your-backend-name.onrender.com/ws'
      }
      
      // Development environment - connect to local server
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
      return `${protocol}//${window.location.host}/ws`
    }
    
    const wsUrl = getWebSocketUrl();
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
    };

    socket.onclose = () => {
      setIsConnected(false);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "game_state_update") {
          setLastMessage(data as GameStateUpdate);
        } else if (data.type === "error") {
          console.error("WebSocket error:", data.message);
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = (message: WebSocketMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  };

  return {
    isConnected,
    lastMessage,
    sendMessage,
  };
}
