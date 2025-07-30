import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useGameState } from "@/hooks/use-game-state";
import { GameCanvas } from "@/components/game-canvas";
import { Chat } from "@/components/chat";
import { VotingPanel } from "@/components/voting-panel";
import { TaskModal } from "@/components/task-modal";
import { Rocket, Wrench, AlertTriangle, Bell, Users, Target, ArrowLeft } from "lucide-react";

export default function Game() {
  const [, setLocation] = useLocation();
  const {
    game,
    players,
    chatMessages,
    currentPlayer,
    isConnected,
    movePlayer,
    completeTask,
    emergencyMeeting,
    reportBody,
    sendChatMessage,
    castVote,
    killPlayer,
    leaveGame
  } = useGameState();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [votingTimeRemaining, setVotingTimeRemaining] = useState(120);

  // Redirect if not in a game
  useEffect(() => {
    if (!currentPlayer || !game) {
      setLocation("/");
    }
  }, [currentPlayer, game, setLocation]);

  // Handle voting timer
  useEffect(() => {
    if (game?.state === "voting") {
      setVotingTimeRemaining(120);
      const timer = setInterval(() => {
        setVotingTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [game?.state]);

  if (!game || !currentPlayer) {
    return <div>Loading...</div>;
  }

  const alivePlayers = players.filter(p => p.isAlive);
  const isAlive = currentPlayer.isAlive;
  const taskProgress = currentPlayer.totalTasks > 0 
    ? (currentPlayer.tasksCompleted / currentPlayer.totalTasks) * 100 
    : 0;

  const handleLeaveGame = () => {
    leaveGame();
    setLocation("/");
  };

  const handlePlayerMove = (position: { x: number; y: number; room: string }) => {
    movePlayer(position);
  };

  const handleTaskInteract = () => {
    if (currentPlayer.role === "crewmate" && isAlive) {
      setShowTaskModal(true);
    }
  };

  const handleCompleteTask = () => {
    completeTask();
  };

  const handleEmergencyMeeting = () => {
    if (isAlive) {
      emergencyMeeting();
    }
  };

  const handleReportBody = () => {
    if (isAlive) {
      const position = currentPlayer.position as { x: number; y: number; room: string };
      reportBody(position);
    }
  };

  const handleKill = () => {
    if (currentPlayer.role === "impostor" && isAlive) {
      // Find nearby players to kill
      const currentPos = currentPlayer.position as { x: number; y: number; room: string };
      const nearbyPlayers = players.filter(p => 
        p.isAlive && 
        p.id !== currentPlayer.id && 
        p.role === "crewmate"
      );

      if (nearbyPlayers.length > 0) {
        // Kill the first nearby player (simplified logic)
        killPlayer(nearbyPlayers[0].id);
      }
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

  // Render voting screen
  if (game.state === "voting") {
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
                <span>{isConnected ? "Connected" : "Disconnected"}</span>
              </div>
              <div className="text-sm text-gray-400">
                Room: <span className="text-game-blue font-mono">{game.roomCode}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-4">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Voting Panel */}
            <div className="xl:col-span-2">
              <VotingPanel
                players={players}
                currentPlayer={currentPlayer}
                onVote={castVote}
                votingTimeRemaining={votingTimeRemaining}
              />
            </div>

            {/* Chat */}
            <div>
              <Card className="bg-game-surface border-gray-600 h-[600px]">
                <CardHeader>
                  <CardTitle>Discussion</CardTitle>
                </CardHeader>
                <CardContent className="h-full">
                  <Chat
                    players={players}
                    chatMessages={chatMessages}
                    onSendMessage={sendChatMessage}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Render game over screen
  if (game.state === "ended") {
    const impostorsWon = alivePlayers.filter(p => p.role === "impostor").length >= alivePlayers.filter(p => p.role === "crewmate").length;
    
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <header className="bg-game-surface border-b border-gray-700 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Rocket className="h-8 w-8 text-game-blue" />
              <h1 className="text-xl font-bold">Spaceship Impostor</h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-6">
          <Card className="bg-game-surface border-gray-600 text-center">
            <CardContent className="pt-6">
              <h2 className={`text-4xl font-bold mb-4 ${impostorsWon ? 'text-game-red' : 'text-game-green'}`}>
                {impostorsWon ? "Impostors Win!" : "Crewmates Win!"}
              </h2>
              <p className="text-gray-400 mb-8">
                {impostorsWon 
                  ? "The impostors have taken over the spaceship!"
                  : "The crew successfully identified all impostors!"
                }
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-game-blue mb-4">Crewmates</h3>
                  <div className="space-y-2">
                    {players.filter(p => p.role === "crewmate").map(player => (
                      <div key={player.id} className="flex items-center space-x-2">
                        <div className={`w-6 h-6 ${colorClasses[player.color]} rounded-full`} />
                        <span className={player.isAlive ? "" : "line-through text-gray-500"}>
                          {player.username}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-game-red mb-4">Impostors</h3>
                  <div className="space-y-2">
                    {players.filter(p => p.role === "impostor").map(player => (
                      <div key={player.id} className="flex items-center space-x-2">
                        <div className={`w-6 h-6 ${colorClasses[player.color]} rounded-full`} />
                        <span className={player.isAlive ? "" : "line-through text-gray-500"}>
                          {player.username}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleLeaveGame}
                className="bg-game-blue hover:bg-blue-600"
                data-testid="button-back-to-lobby"
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Render main game screen
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
              <span>{isConnected ? "Connected" : "Disconnected"}</span>
            </div>
            <div className="text-sm text-gray-400">
              Room: <span className="text-game-blue font-mono">{game.roomCode}</span>
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

      {/* Main Game */}
      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* Game Canvas */}
          <div className="xl:col-span-3">
            <GameCanvas
              players={players}
              currentPlayer={currentPlayer}
              onPlayerMove={handlePlayerMove}
              onTaskInteract={handleTaskInteract}
            />
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Player Status */}
            <Card className="bg-game-surface border-gray-600">
              <CardHeader>
                <CardTitle className="text-sm">Your Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Role:</span>
                  <span className={`font-medium ${currentPlayer.role === "impostor" ? "text-game-red" : "text-game-blue"}`}>
                    {currentPlayer.role === "impostor" ? "Impostor" : "Crewmate"}
                  </span>
                </div>
                {currentPlayer.role === "crewmate" && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Tasks:</span>
                      <span className="font-medium" data-testid="task-progress">
                        {currentPlayer.tasksCompleted}/{currentPlayer.totalTasks}
                      </span>
                    </div>
                    <Progress value={taskProgress} className="w-full" />
                  </>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status:</span>
                  <span className={`font-medium ${isAlive ? "text-game-green" : "text-game-red"}`}>
                    {isAlive ? "Alive" : "Dead"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card className="bg-game-surface border-gray-600">
              <CardHeader>
                <CardTitle className="text-sm">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {currentPlayer.role === "crewmate" && (
                  <Button
                    onClick={handleTaskInteract}
                    disabled={!isAlive}
                    className="w-full bg-game-blue hover:bg-blue-600"
                    data-testid="button-use-task"
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    Use/Task
                  </Button>
                )}
                
                {currentPlayer.role === "impostor" && (
                  <Button
                    onClick={handleKill}
                    disabled={!isAlive}
                    className="w-full bg-game-red hover:bg-red-600"
                    data-testid="button-kill"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Kill
                  </Button>
                )}

                <Button
                  onClick={handleReportBody}
                  disabled={!isAlive}
                  className="w-full bg-game-red hover:bg-red-600"
                  data-testid="button-report-body"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report
                </Button>
                
                <Button
                  onClick={handleEmergencyMeeting}
                  disabled={!isAlive}
                  className="w-full bg-game-yellow hover:bg-yellow-600"
                  data-testid="button-emergency-meeting"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Emergency
                </Button>
              </CardContent>
            </Card>

            {/* Alive Players */}
            <Card className="bg-game-surface border-gray-600">
              <CardHeader>
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Players ({alivePlayers.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className={`flex items-center space-x-2 text-sm ${
                        !player.isAlive ? "opacity-50" : ""
                      }`}
                      data-testid={`player-status-${player.id}`}
                    >
                      <div className={`w-3 h-3 ${colorClasses[player.color]} rounded-full`} />
                      <span className={!player.isAlive ? "line-through" : ""}>
                        {player.username}
                      </span>
                      {!player.isAlive && (
                        <span className="text-game-red text-xs ml-auto">💀</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onComplete={handleCompleteTask}
      />
    </div>
  );
}
