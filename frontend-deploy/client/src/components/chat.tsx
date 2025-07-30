import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Player, type ChatMessage } from "@shared/schema";
import { Send } from "lucide-react";

interface ChatProps {
  players: Player[];
  chatMessages: ChatMessage[];
  onSendMessage: (message: string) => void;
}

export function Chat({ players, chatMessages, onSendMessage }: ChatProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const getPlayerByIdColor = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.color : "gray";
  };

  const getPlayerByIdName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.username : "Unknown";
  };

  const colorClasses: { [key: string]: string } = {
    red: "text-red-400",
    blue: "text-blue-400",
    green: "text-green-400",
    yellow: "text-yellow-400",
    purple: "text-purple-400",
    pink: "text-pink-400",
    orange: "text-orange-400",
    white: "text-gray-100",
    black: "text-gray-800",
    brown: "text-amber-600"
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 bg-gray-800 rounded-lg p-4 overflow-y-auto mb-4 min-h-[300px] max-h-[300px]" data-testid="chat-messages">
        {chatMessages.length === 0 ? (
          <div className="text-gray-400 text-center text-sm">No messages yet. Start the discussion!</div>
        ) : (
          chatMessages.map((msg) => {
            const playerColor = getPlayerByIdColor(msg.playerId);
            const playerName = getPlayerByIdName(msg.playerId);
            const colorClass = colorClasses[playerColor] || "text-gray-400";
            
            return (
              <div key={msg.id} className="mb-2" data-testid={`chat-message-${msg.id}`}>
                <span className={`font-medium ${colorClass}`}>{playerName}:</span>
                <span className="ml-2 text-gray-100">{msg.message}</span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 bg-gray-800 border-gray-600"
          maxLength={200}
          data-testid="input-chat-message"
        />
        <Button 
          type="submit" 
          className="bg-game-blue hover:bg-blue-600"
          disabled={!message.trim()}
          data-testid="button-send-message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
