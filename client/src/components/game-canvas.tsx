import { useEffect, useRef } from "react";
import { type Player } from "@shared/schema";
import { ROOMS } from "@shared/schema";

interface GameCanvasProps {
  players: Player[];
  currentPlayer: Player | null;
  onPlayerMove: (position: { x: number; y: number; room: string }) => void;
  onTaskInteract: () => void;
}

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 500;
const PLAYER_SIZE = 12;

export function GameCanvas({ players, currentPlayer, onPlayerMove, onTaskInteract }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  // Handle player movement with keyboard
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!currentPlayer || !currentPlayer.isAlive) return;

      const currentPos = currentPlayer.position as { x: number; y: number; room: string };
      let newX = currentPos.x;
      let newY = currentPos.y;
      let newRoom = currentPos.room;

      const moveSpeed = 3;

      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          newY = Math.max(0, newY - moveSpeed);
          break;
        case 's':
        case 'arrowdown':
          newY = Math.min(CANVAS_HEIGHT - PLAYER_SIZE, newY + moveSpeed);
          break;
        case 'a':
        case 'arrowleft':
          newX = Math.max(0, newX - moveSpeed);
          break;
        case 'd':
        case 'arrowright':
          newX = Math.min(CANVAS_WIDTH - PLAYER_SIZE, newX + moveSpeed);
          break;
        case ' ':
          e.preventDefault();
          onTaskInteract();
          return;
      }

      // Check which room the player is in
      for (const room of ROOMS) {
        if (newX >= room.x && newX <= room.x + room.width && 
            newY >= room.y && newY <= room.y + room.height) {
          newRoom = room.id;
          break;
        }
      }

      if (newX !== currentPos.x || newY !== currentPos.y || newRoom !== currentPos.room) {
        onPlayerMove({ x: newX, y: newY, room: newRoom });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPlayer, onPlayerMove, onTaskInteract]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // Clear canvas
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw rooms
      ROOMS.forEach(room => {
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 2;
        ctx.strokeRect(room.x, room.y, room.width, room.height);
        
        // Room background with alpha
        const colors: { [key: string]: string } = {
          cafeteria: '#2563eb30',
          medbay: '#16a34a30',
          electrical: '#eab30830',
          reactor: '#a855f730',
          central: '#37415130'
        };
        
        ctx.fillStyle = colors[room.id] || '#37415130';
        ctx.fillRect(room.x, room.y, room.width, room.height);
        
        // Room label
        ctx.fillStyle = '#d1d5db';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(room.name, room.x + room.width / 2, room.y + room.height / 2);
      });

      // Draw task indicators (simple yellow dots)
      const taskLocations = [
        { x: 120, y: 120 },
        { x: 420, y: 120 },
        { x: 120, y: 420 },
        { x: 420, y: 420 }
      ];

      taskLocations.forEach(task => {
        ctx.beginPath();
        ctx.arc(task.x, task.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#eab308';
        ctx.fill();
        
        // Pulse effect
        const pulseSize = 6 + Math.sin(Date.now() / 300) * 2;
        ctx.beginPath();
        ctx.arc(task.x, task.y, pulseSize, 0, 2 * Math.PI);
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Draw players
      players.forEach(player => {
        if (!player.isAlive) return;

        const pos = player.position as { x: number; y: number; room: string };
        
        // Player circle
        ctx.beginPath();
        ctx.arc(pos.x + PLAYER_SIZE / 2, pos.y + PLAYER_SIZE / 2, PLAYER_SIZE / 2, 0, 2 * Math.PI);
        
        // Color mapping
        const colorMap: { [key: string]: string } = {
          red: '#ef4444',
          blue: '#3b82f6',
          green: '#22c55e',
          yellow: '#eab308',
          purple: '#a855f7',
          pink: '#ec4899',
          orange: '#f97316',
          white: '#f8fafc',
          black: '#1f2937',
          brown: '#a3a3a3'
        };
        
        ctx.fillStyle = colorMap[player.color] || '#6b7280';
        ctx.fill();
        
        // Player border
        ctx.strokeStyle = currentPlayer?.id === player.id ? '#ffffff' : '#374151';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Player name
        ctx.fillStyle = '#f3f4f6';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(player.username, pos.x + PLAYER_SIZE / 2, pos.y - 5);
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [players, currentPlayer]);

  return (
    <div className="relative bg-gray-800 rounded-lg p-4">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border border-gray-600 rounded bg-gray-900"
        data-testid="game-canvas"
      />
      <div className="absolute top-2 left-2 text-xs text-gray-400">
        Use WASD or arrow keys to move, SPACE to interact
      </div>
    </div>
  );
}
