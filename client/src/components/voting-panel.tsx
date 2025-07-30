import { useState } from "react";
import { Button } from "@/components/ui/button";
import { type Player } from "@shared/schema";

interface VotingPanelProps {
  players: Player[];
  currentPlayer: Player | null;
  onVote: (targetId?: string) => void;
  votingTimeRemaining: number;
}

export function VotingPanel({ players, currentPlayer, onVote, votingTimeRemaining }: VotingPanelProps) {
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const alivePlayers = players.filter(p => p.isAlive);
  const voteCounts = new Map<string, number>();

  // Count votes (simplified - in real implementation this would come from server)
  alivePlayers.forEach(player => {
    if (player.votedFor) {
      voteCounts.set(player.votedFor, (voteCounts.get(player.votedFor) || 0) + 1);
    }
  });

  const handleVote = (targetId?: string) => {
    if (hasVoted || !currentPlayer?.isAlive) return;
    
    setSelectedVote(targetId || "skip");
    setHasVoted(true);
    onVote(targetId);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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
    <div className="max-w-4xl mx-auto">
      <div className="bg-game-surface rounded-lg p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-game-red mb-2" data-testid="text-meeting-title">Emergency Meeting</h2>
          <p className="text-gray-400">Discuss and vote to eliminate a player</p>
          <div className="mt-4">
            <div className="text-sm text-gray-400">Time remaining</div>
            <div className="text-3xl font-bold text-game-yellow" data-testid="text-voting-time">
              {formatTime(votingTimeRemaining)}
            </div>
          </div>
        </div>

        {/* Voting Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {alivePlayers.map((player) => (
            <div key={player.id} className="bg-gray-800 rounded-lg p-4 text-center" data-testid={`voting-card-${player.id}`}>
              <div className={`w-16 h-16 ${colorClasses[player.color] || 'bg-gray-500'} rounded-full mx-auto mb-2 border-2 border-gray-600`} />
              <div className="font-medium mb-2 text-sm">{player.username}</div>
              <Button
                onClick={() => handleVote(player.id)}
                disabled={hasVoted || !currentPlayer?.isAlive || currentPlayer?.id === player.id}
                className={`w-full text-sm transition-colors ${
                  selectedVote === player.id 
                    ? 'bg-game-red hover:bg-red-600' 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
                data-testid={`button-vote-${player.id}`}
              >
                Vote ({voteCounts.get(player.id) || 0})
              </Button>
            </div>
          ))}
        </div>

        {/* Skip Vote Button */}
        <div className="mt-6 text-center">
          <Button
            onClick={() => handleVote()}
            disabled={hasVoted || !currentPlayer?.isAlive}
            className={`transition-colors ${
              selectedVote === "skip" 
                ? 'bg-gray-400 hover:bg-gray-500' 
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
            data-testid="button-skip-vote"
          >
            Skip Vote
          </Button>
        </div>

        {/* Voting Status */}
        {hasVoted && (
          <div className="mt-4 text-center text-green-400" data-testid="text-vote-confirmed">
            Vote submitted! Waiting for other players...
          </div>
        )}
      </div>
    </div>
  );
}
