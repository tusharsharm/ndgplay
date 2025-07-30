import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Zap, Check } from "lucide-react";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface WireConnection {
  from: number;
  to: number;
  color: string;
}

export function TaskModal({ isOpen, onClose, onComplete }: TaskModalProps) {
  const [connections, setConnections] = useState<WireConnection[]>([]);
  const [selectedWire, setSelectedWire] = useState<number | null>(null);
  
  const wireColors = ["red", "blue", "green"];
  const targetConnections = [
    { from: 0, to: 1, color: "red" },
    { from: 1, to: 0, color: "blue" },
    { from: 2, to: 2, color: "green" }
  ];

  const handleWireClick = (side: 'left' | 'right', index: number) => {
    if (side === 'left') {
      setSelectedWire(index);
    } else if (selectedWire !== null) {
      const newConnection = {
        from: selectedWire,
        to: index,
        color: wireColors[selectedWire]
      };
      
      // Remove any existing connection from this left wire
      const filteredConnections = connections.filter(conn => conn.from !== selectedWire);
      setConnections([...filteredConnections, newConnection]);
      setSelectedWire(null);
    }
  };

  const isTaskComplete = () => {
    if (connections.length !== 3) return false;
    
    return targetConnections.every(target => 
      connections.some(conn => 
        conn.from === target.from && 
        conn.to === target.to && 
        conn.color === target.color
      )
    );
  };

  const handleComplete = () => {
    if (isTaskComplete()) {
      onComplete();
      onClose();
      // Reset for next time
      setConnections([]);
      setSelectedWire(null);
    }
  };

  const resetTask = () => {
    setConnections([]);
    setSelectedWire(null);
  };

  const getWireColor = (color: string) => {
    const colors: { [key: string]: string } = {
      red: "#ef4444",
      blue: "#3b82f6",
      green: "#22c55e"
    };
    return colors[color] || "#6b7280";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-game-surface border-gray-600 max-w-md" data-testid="task-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-game-yellow" />
              <span>Fix Wiring</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
              data-testid="button-close-task"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <p className="text-gray-400 text-center mb-6">Connect the colored wires to their matching terminals</p>
          
          {/* Wiring Interface */}
          <div className="flex justify-between items-center mb-6">
            {/* Left Side - Sources */}
            <div className="space-y-4">
              {wireColors.map((color, index) => (
                <button
                  key={`left-${index}`}
                  onClick={() => handleWireClick('left', index)}
                  className={`w-6 h-4 rounded-sm border-2 transition-all ${
                    selectedWire === index 
                      ? 'border-white scale-110' 
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: getWireColor(color) }}
                  data-testid={`wire-source-${color}`}
                />
              ))}
            </div>

            {/* Center - Connection Lines */}
            <div className="flex-1 mx-6 relative h-24">
              <svg className="w-full h-full">
                {connections.map((conn, index) => (
                  <line
                    key={index}
                    x1="0"
                    y1={conn.from * 30 + 15}
                    x2="100%"
                    y2={conn.to * 30 + 15}
                    stroke={getWireColor(conn.color)}
                    strokeWidth="3"
                    data-testid={`wire-connection-${conn.from}-${conn.to}`}
                  />
                ))}
                {/* Dashed line for selected wire */}
                {selectedWire !== null && (
                  <line
                    x1="0"
                    y1={selectedWire * 30 + 15}
                    x2="100%"
                    y2="50%"
                    stroke={getWireColor(wireColors[selectedWire])}
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    opacity="0.5"
                  />
                )}
              </svg>
            </div>

            {/* Right Side - Targets (shuffled order) */}
            <div className="space-y-4">
              {[wireColors[1], wireColors[0], wireColors[2]].map((color, index) => (
                <button
                  key={`right-${index}`}
                  onClick={() => handleWireClick('right', index)}
                  className="w-6 h-4 rounded-sm border-2 border-gray-600 hover:border-gray-400 transition-all"
                  style={{ backgroundColor: getWireColor(color) }}
                  data-testid={`wire-target-${color}`}
                />
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-between">
            <Button
              onClick={resetTask}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              data-testid="button-reset-task"
            >
              Reset
            </Button>
            
            <Button
              onClick={handleComplete}
              disabled={!isTaskComplete()}
              className={`${
                isTaskComplete() 
                  ? 'bg-game-green hover:bg-green-600' 
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
              data-testid="button-complete-task"
            >
              {isTaskComplete() ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Complete Task
                </>
              ) : (
                'Complete Task'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
