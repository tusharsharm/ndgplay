import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useGameState } from "@/hooks/use-game-state";
import { Rocket, Crown, Copy, Play, Users, Settings, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Lobby() {
  const [, setLocation] = useLocation();
  const { game, players, currentPlayer, isConnected, startGame, leaveGame } = useGameState();
  const { toast } = useToast();
  const [discussionTime, setDiscussionTime] = useState(45);
  const [votingTime, setVotingTime] = useState(120);
  const [anonymousVotes, setAnonymousVotes] = useState(true);

  // Redirect if not in a game
  useEffect(() => {
    if (!currentPlayer || !game) {
      setLocation("/");
    }
  }, [currentPlayer, game, setLocation]);

  // Redirect to game screen if game starts
  useEffect(() => {
    if (game?.state === "playing") {
      setLocation("/game");
    }
  }, [game?.state, setLocation]);

  if (!game || !currentPlayer) {
    return <div>Loading...</div>;
  }

  const isHost = currentPlayer.isHost;
  const canStart = players.length >= 4 && players.length <= 10;

  const handleStartGame = () => {
    if (canStart && isHost) {
      startGame();
    }
  };

  const handleLeaveGame = () => {
    leaveGame();
    setLocation("/");
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(game.roomCode);
      toast({
        title: "Room code copied!",
        description: "Share this code with your friends to join the game.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the room code manually.",
        variant: "destructive",
      });
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
            <h1 className="text-xl font-bold">Spaceship Impostor</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-game-green animate-pulse' : 'bg-game-red'}`} />
              <span data-testid="connection-status">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
            <div className="text-sm text-gray-400">
              Room: <span className="text-game-blue font-mono" data-testid="room-code">{game.roomCode}</span>
            </div>
            <Button
              onClick={handleLeaveGame}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              data-testid="button-leave-game"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Leave
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Players List */}
          <div className="lg:col-span-2">
            <Card className="bg-game-surface border-gray-600">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Players <span className="text-game-blue" data-testid="player-count">({players.length}/10)</span></span>
                  </CardTitle>
                  <Button
                    onClick={copyRoomCode}
                    size="sm"
                    className="bg-game-blue hover:bg-blue-600"
                    data-testid="button-copy-room-code"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Code
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="bg-gray-800 rounded-lg p-3 flex items-center space-x-3"
                      data-testid={`player-card-${player.id}`}
                    >
                      <div className={`w-8 h-8 ${colorClasses[player.color]} rounded-full border-2 border-gray-600`} />
                      <span className="font-medium text-sm">{player.username}</span>
                      {player.isHost && (
                        <Crown className="h-4 w-4 text-game-yellow ml-auto" />
                      )}
                    </div>
                  ))}
                  
                  {/* Empty slots */}
                  {Array.from({ length: 10 - players.length }, (_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="bg-gray-800 bg-opacity-50 rounded-lg p-3 flex items-center justify-center border-2 border-dashed border-gray-600"
                    >
                      <span className="text-gray-500 text-sm">Waiting...</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Settings & Controls */}
          <div className="space-y-6">
            {/* Game Settings */}
            <Card className="bg-game-surface border-gray-600">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Game Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Impostors</label>
                  <Select defaultValue="2" disabled={!isHost}>
                    <SelectTrigger className="bg-gray-800 border-gray-600" data-testid="select-impostors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Discussion Time: {discussionTime}s
                  </label>
                  <Slider
                    value={[discussionTime]}
                    onValueChange={(value) => setDiscussionTime(value[0])}
                    min={15}
                    max={120}
                    step={15}
                    disabled={!isHost}
                    className="w-full"
                    data-testid="slider-discussion-time"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Voting Time: {votingTime}s
                  </label>
                  <Slider
                    value={[votingTime]}
                    onValueChange={(value) => setVotingTime(value[0])}
                    min={15}
                    max={300}
                    step={15}
                    disabled={!isHost}
                    className="w-full"
                    data-testid="slider-voting-time"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymousVotes"
                    checked={anonymousVotes}
                    onCheckedChange={(checked) => setAnonymousVotes(checked === true)}
                    disabled={!isHost}
                    data-testid="checkbox-anonymous-votes"
                  />
                  <label htmlFor="anonymousVotes" className="text-sm">
                    Anonymous Votes
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Start Game Button */}
            <Button
              onClick={handleStartGame}
              disabled={!canStart || !isHost || !isConnected}
              className="w-full bg-game-green hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg"
              data-testid="button-start-game"
            >
              <Play className="h-5 w-5 mr-2" />
              {!isHost ? "Waiting for host..." : 
               !canStart ? `Need ${4 - players.length} more players` : 
               "Start Game"}
            </Button>

            {/* Game Info */}
            <Card className="bg-game-surface border-gray-600">
              <CardContent className="pt-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Min Players:</span>
                    <span>4</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Players:</span>
                    <span>10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-game-blue">Waiting</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
