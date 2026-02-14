import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trophy, Swords, Heart } from 'lucide-react';
import type { CombatResult } from '../types/combat';

interface CombatOutcomeCardProps {
  result: CombatResult;
  isPlayerWinner: boolean;
  encounterNumber?: number;
}

export default function CombatOutcomeCard({ result, isPlayerWinner, encounterNumber }: CombatOutcomeCardProps) {
  const winnerPrincipal = result.winner.toString();
  const loserPrincipal = result.loser.toString();
  
  return (
    <Card className={`border-2 ${isPlayerWinner ? 'border-accent bg-accent/5' : 'border-destructive/50 bg-destructive/5'}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isPlayerWinner ? (
            <>
              <Trophy className="h-5 w-5 text-accent" />
              Victory!
            </>
          ) : (
            <>
              <Swords className="h-5 w-5 text-destructive" />
              Defeat
            </>
          )}
        </CardTitle>
        {encounterNumber !== undefined && (
          <CardDescription>Encounter {encounterNumber} Complete</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className={isPlayerWinner ? 'bg-accent/10 border-accent/30' : 'bg-muted'}>
          <AlertDescription className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Winner:</span>
              <span className="text-xs font-mono truncate max-w-[200px]">{winnerPrincipal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Loser:</span>
              <span className="text-xs font-mono truncate max-w-[200px]">{loserPrincipal}</span>
            </div>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground">Winner Health</div>
            <div className="flex items-center gap-2 font-semibold text-lg">
              <Heart className="h-4 w-4 text-accent" />
              {result.winnerHealth.toString()}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Rounds</div>
            <div className="flex items-center gap-2 font-semibold text-lg">
              <Swords className="h-4 w-4" />
              {result.rounds.toString()}
            </div>
          </div>
        </div>

        {isPlayerWinner && (
          <Alert className="bg-accent/10 border-accent/30">
            <Trophy className="h-4 w-4 text-accent" />
            <AlertDescription>
              Points awarded! Check your rank to see your progress.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
