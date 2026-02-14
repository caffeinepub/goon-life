import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetMyStats, useGetAllRanks, useFindMatch, useResolveCombat } from '../hooks/useQueries';
import RankBadge from '../components/RankBadge';
import CombatOutcomeCard from '../components/CombatOutcomeCard';
import { toast } from 'sonner';
import { Swords, Trophy, AlertCircle, Users, Loader2 } from 'lucide-react';
import { normalizeCombatError } from '../utils/combatErrors';
import type { CombatResult } from '../types/combat';
import type { MatchState } from '../backend';

export default function Multiplayer() {
  const { identity } = useInternetIdentity();
  const { data: myStats } = useGetMyStats();
  const { data: ranks } = useGetAllRanks();
  const findMatch = useFindMatch();
  const resolveCombat = useResolveCombat();

  const [currentMatch, setCurrentMatch] = useState<MatchState | null>(null);
  const [combatResult, setCombatResult] = useState<CombatResult | null>(null);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);

  const isAuthenticated = !!identity;
  const myRank = ranks?.find(r => r.id === myStats?.currentRankId);
  const myPrincipal = identity?.getPrincipal().toString();

  const handlePlay = async () => {
    try {
      setCombatResult(null);
      setIsWaitingForOpponent(false);
      
      const match = await findMatch.mutateAsync(false);
      
      if (match) {
        // Match found with opponent
        setCurrentMatch(match);
        toast.success('Match found! Ready to fight.');
      } else {
        // Waiting for opponent
        setIsWaitingForOpponent(true);
        toast.info('Waiting for an opponent to join...');
      }
    } catch (error: any) {
      console.error('Failed to find match:', error);
      toast.error(normalizeCombatError(error));
      setIsWaitingForOpponent(false);
    }
  };

  const handlePlaySolo = async () => {
    try {
      setCombatResult(null);
      setIsWaitingForOpponent(false);
      
      const match = await findMatch.mutateAsync(true);
      
      if (match) {
        // Solo match created successfully
        setCurrentMatch(match);
        toast.success('Solo match created! Ready to fight.');
      } else {
        // Solo should never return null - this is an unexpected error
        throw new Error('Failed to create solo match. Please try again.');
      }
    } catch (error: any) {
      console.error('Failed to create solo match:', error);
      toast.error(normalizeCombatError(error));
      setIsWaitingForOpponent(false);
      setCurrentMatch(null);
    }
  };

  const handleFight = async () => {
    if (!currentMatch) {
      toast.error('No active match. Please start a new match.');
      return;
    }

    try {
      const result = await resolveCombat.mutateAsync(currentMatch.id);
      setCombatResult(result);
      toast.success('Combat resolved successfully!');
      setCurrentMatch(null);
      setIsWaitingForOpponent(false);
    } catch (error: any) {
      console.error('Failed to resolve combat:', error);
      toast.error(normalizeCombatError(error));
    }
  };

  const isPlayerWinner = combatResult && myPrincipal 
    ? combatResult.winner.toString() === myPrincipal 
    : false;

  const isSoloMatch = currentMatch && currentMatch.player1.toString() === currentMatch.player2.toString();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            <Swords className="h-8 w-8 text-primary" />
            Online Multiplayer
          </h1>
          <p className="text-muted-foreground text-lg">
            Challenge opponents and climb the ranks
          </p>
        </div>

        {/* Auth Warning */}
        {!isAuthenticated && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please log in to play multiplayer matches. You can view the leaderboard without logging in.
            </AlertDescription>
          </Alert>
        )}

        {/* My Rank */}
        {isAuthenticated && myStats && myRank && (
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Your Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RankBadge rank={myRank} points={myStats.points} size="lg" />
            </CardContent>
          </Card>
        )}

        {/* Combat Result */}
        {combatResult && (
          <CombatOutcomeCard 
            result={combatResult} 
            isPlayerWinner={isPlayerWinner}
          />
        )}

        {/* Main Play Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Quick Match
            </CardTitle>
            <CardDescription>
              Find a random opponent or play solo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Waiting State - Only for multiplayer queue */}
            {isWaitingForOpponent && !currentMatch && (
              <Alert className="bg-accent/10 border-accent/30">
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Waiting for an opponent to join the multiplayer queue... You can also start a solo match instead.
                </AlertDescription>
              </Alert>
            )}

            {/* Active Match State */}
            {currentMatch && !isWaitingForOpponent && (
              <Alert className="bg-primary/10 border-primary/30">
                <Swords className="h-4 w-4" />
                <AlertDescription className="space-y-2">
                  <p className="font-medium">
                    {isSoloMatch ? 'Solo match ready!' : 'Match found!'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Match ID: <code className="bg-background px-2 py-1 rounded text-xs">{currentMatch.id}</code>
                  </p>
                  {!isSoloMatch && (
                    <p className="text-sm">
                      Opponent: <code className="bg-background px-2 py-1 rounded text-xs">
                        {currentMatch.player1.toString() === myPrincipal 
                          ? currentMatch.player2.toString().slice(0, 20) + '...'
                          : currentMatch.player1.toString().slice(0, 20) + '...'}
                      </code>
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={handlePlay}
                disabled={!isAuthenticated || findMatch.isPending || !!currentMatch}
                size="lg"
                className="w-full"
              >
                {findMatch.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finding Match...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Play
                  </>
                )}
              </Button>

              <Button
                onClick={handlePlaySolo}
                disabled={!isAuthenticated || findMatch.isPending || !!currentMatch}
                size="lg"
                variant="outline"
                className="w-full"
              >
                {findMatch.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Swords className="mr-2 h-4 w-4" />
                    Play Solo
                  </>
                )}
              </Button>
            </div>

            {/* Fight Button */}
            {currentMatch && (
              <Button
                onClick={handleFight}
                disabled={!isAuthenticated || resolveCombat.isPending}
                size="lg"
                className="w-full"
                variant="default"
              >
                {resolveCombat.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Resolving Combat...
                  </>
                ) : (
                  <>
                    <Swords className="mr-2 h-5 w-5" />
                    Fight!
                  </>
                )}
              </Button>
            )}

            {/* Info Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>How it works:</strong> Press "Play" to find a random opponent or "Play Solo" to fight alone. 
                Once matched, press "Fight!" to resolve the combat and earn points.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
