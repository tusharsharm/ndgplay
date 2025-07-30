import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PLAYER_COLORS } from "@shared/schema";
import { Rocket, Users, Play } from "lucide-react";
import { useGameState } from "@/hooks/use-game-state";

export default function Home() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const { joinGame, isConnected } = useGameState();

  const generateRoomCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
  };

  const handleJoinGame = () => {
    if (username.trim() && roomCode.trim() && selectedColor) {
      joinGame(roomCode.trim().toUpperCase(), username.trim(), selectedColor);
      setLocation("/lobby");
    }
  };

  const handleCreateGame = () => {
    if (username.trim() && selectedColor) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      joinGame(code, username.trim(), selectedColor);
      setLocation("/lobby");
    }
  };

  const colorClasses: { [key: string]: string } = {
    red: "bg-red-500",
    blue: "bg-blue-500", 
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
    pink: "bg-pink-500",
    orange: "bg-orange-500",
    white: "bg-gray-100",
    black: "bg-gray-800",
    brown: "bg-amber-600"
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-game-surface border-b border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Rocket className="h-8 w-8 text-game-blue" />
            <h1 className="text-2xl font-bold">Spaceship Impostor</h1>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-game-green animate-pulse' : 'bg-game-red'}`} />
            <span data-testid="connection-status">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4">Welcome to Spaceship Impostor</h2>
          <p className="text-gray-400 text-lg">Find the impostors among your crew before it's too late!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Join Game */}
          <Card className="bg-game-surface border-gray-600">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-game-blue" />
                <span>Join Game</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <Input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-gray-800 border-gray-600"
                  maxLength={20}
                  data-testid="input-username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Room Code</label>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="ABCD12"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="bg-gray-800 border-gray-600 uppercase"
                    maxLength={6}
                    data-testid="input-room-code"
                  />
                  <Button
                    onClick={generateRoomCode}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    data-testid="button-generate-code"
                  >
                    Generate
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Choose Color</label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger className="bg-gray-800 border-gray-600" data-testid="select-color">
                    <SelectValue placeholder="Select your color" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {PLAYER_COLORS.map((color) => (
                      <SelectItem key={color} value={color} className="hover:bg-gray-700">
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded-full ${colorClasses[color]}`} />
                          <span className="capitalize">{color}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleJoinGame}
                disabled={!username.trim() || !roomCode.trim() || !selectedColor || !isConnected}
                className="w-full bg-game-blue hover:bg-blue-600"
                data-testid="button-join-game"
              >
                <Users className="h-4 w-4 mr-2" />
                Join Game
              </Button>
            </CardContent>
          </Card>

          {/* Create Game */}
          <Card className="bg-game-surface border-gray-600">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Play className="h-5 w-5 text-game-green" />
                <span>Create Game</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <Input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-gray-800 border-gray-600"
                  maxLength={20}
                  data-testid="input-username-create"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Choose Color</label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger className="bg-gray-800 border-gray-600" data-testid="select-color-create">
                    <SelectValue placeholder="Select your color" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {PLAYER_COLORS.map((color) => (
                      <SelectItem key={color} value={color} className="hover:bg-gray-700">
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded-full ${colorClasses[color]}`} />
                          <span className="capitalize">{color}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  Create a new game room and share the code with your friends!
                </p>
              </div>

              <Button
                onClick={handleCreateGame}
                disabled={!username.trim() || !selectedColor || !isConnected}
                className="w-full bg-game-green hover:bg-green-600"
                data-testid="button-create-game"
              >
                <Play className="h-4 w-4 mr-2" />
                Create Game
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Game Rules */}
        <Card className="bg-game-surface border-gray-600 mt-8">
          <CardHeader>
            <CardTitle>How to Play</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-semibold text-game-blue mb-2">Crewmates</h4>
                <ul className="space-y-1 text-gray-400">
                  <li>• Complete all tasks to win</li>
                  <li>• Find and vote out impostors</li>
                  <li>• Call emergency meetings</li>
                  <li>• Report dead bodies</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-game-red mb-2">Impostors</h4>
                <ul className="space-y-1 text-gray-400">
                  <li>• Eliminate crewmates</li>
                  <li>• Sabotage the ship</li>
                  <li>• Pretend to do tasks</li>
                  <li>• Avoid being voted out</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-game-yellow mb-2">Controls</h4>
                <ul className="space-y-1 text-gray-400">
                  <li>• WASD/Arrow keys to move</li>
                  <li>• SPACE to interact/use</li>
                  <li>• Use action buttons</li>
                  <li>• Vote during meetings</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
