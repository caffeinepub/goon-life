import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useHasPurchasedAccess, useIsStripeConfigured, useResolveStoryModeCombat, useGetMyStats } from '../hooks/useQueries';
import BuyGoonFighterButton from '../components/BuyGoonFighterButton';
import StripeSetupDialog from '../components/StripeSetupDialog';
import CombatOutcomeCard from '../components/CombatOutcomeCard';
import { BookOpen, Lock, AlertCircle, Crown, Swords, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeCombatError } from '../utils/combatErrors';
import type { CombatResult } from '../types/combat';

export default function StoryMode() {
  const { identity } = useInternetIdentity();
  const { data: hasAccess, isLoading: accessLoading } = useHasPurchasedAccess();
  const { data: stripeConfigured, isLoading: stripeLoading } = useIsStripeConfigured();
  const { data: myStats } = useGetMyStats();
  const resolveStoryModeCombat = useResolveStoryModeCombat();
  
  const [showStripeSetup, setShowStripeSetup] = useState(false);
  const [currentEncounter, setCurrentEncounter] = useState(1);
  const [combatResult, setCombatResult] = useState<CombatResult | null>(null);

  const isAuthenticated = !!identity;
  const isLoading = accessLoading || stripeLoading;
  const myPrincipal = identity?.getPrincipal().toString();

  const handleStartEncounter = async () => {
    try {
      const result = await resolveStoryModeCombat.mutateAsync(BigInt(currentEncounter));
      setCombatResult(result);
      toast.success('Encounter complete!');
    } catch (error: any) {
      console.error('Failed to resolve encounter:', error);
      toast.error(normalizeCombatError(error));
    }
  };

  const handleNextEncounter = () => {
    setCurrentEncounter(prev => prev + 1);
    setCombatResult(null);
  };

  const isPlayerWinner = combatResult && myPrincipal 
    ? combatResult.winner.toString() === myPrincipal 
    : false;

  // Show Stripe setup for admins if not configured
  if (!stripeLoading && !stripeConfigured) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
              <BookOpen className="h-8 w-8 text-secondary" />
              Goon Fighter Story Mode
            </h1>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Stripe payment is not configured. Admin setup is required to enable purchases.
            </AlertDescription>
          </Alert>

          <Card className="border-secondary/30">
            <CardHeader>
              <CardTitle>Admin Configuration Required</CardTitle>
              <CardDescription>
                Configure Stripe to enable story mode purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowStripeSetup(true)}>
                Configure Stripe
              </Button>
            </CardContent>
          </Card>

          <StripeSetupDialog open={showStripeSetup} onClose={() => setShowStripeSetup(false)} />
        </div>
      </div>
    );
  }

  // Auth required
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
              <BookOpen className="h-8 w-8 text-secondary" />
              Goon Fighter Story Mode
            </h1>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please log in to access or purchase Goon Fighter story mode.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Paywall - user hasn't purchased
  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
              <BookOpen className="h-8 w-8 text-secondary" />
              Goon Fighter Story Mode
            </h1>
            <p className="text-muted-foreground text-lg">
              Unlock the epic story campaign
            </p>
          </div>

          <Card className="border-secondary/30 bg-gradient-to-br from-secondary/5 to-transparent">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-secondary/20">
                  <Lock className="h-12 w-12 text-secondary" />
                </div>
              </div>
              <CardTitle className="text-3xl">Premium Story Mode</CardTitle>
              <CardDescription className="text-base">
                One-time purchase • Lifetime access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">What's Included:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Crown className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span>Epic story campaign with multiple encounters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Crown className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span>Progressive combat system with increasing difficulty</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Crown className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span>Earn points and climb the global leaderboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Crown className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                    <span>Lifetime access with all future updates</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-center pt-4">
                <BuyGoonFighterButton />
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Secure payment powered by Stripe
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Unlocked - user has purchased
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            <BookOpen className="h-8 w-8 text-secondary" />
            Goon Fighter Story Mode
          </h1>
          <p className="text-muted-foreground text-lg">
            Welcome back, fighter!
          </p>
        </div>

        <Alert className="bg-accent/10 border-accent/30">
          <Crown className="h-4 w-4 text-accent" />
          <AlertDescription>
            You have full access to Goon Fighter story mode! Complete encounters to earn points and rank up.
          </AlertDescription>
        </Alert>

        {myStats && (
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Swords className="h-5 w-5 text-primary" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="text-muted-foreground">Total Points</div>
                  <div className="font-semibold text-2xl">{myStats.points.toString()}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Games Played</div>
                  <div className="font-semibold text-2xl">{myStats.gamesPlayed.toString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {combatResult && (
          <CombatOutcomeCard 
            result={combatResult} 
            isPlayerWinner={isPlayerWinner}
            encounterNumber={currentEncounter}
          />
        )}

        <Card className="border-secondary/30">
          <CardHeader>
            <CardTitle>Encounter {currentEncounter}</CardTitle>
            <CardDescription>
              Face your opponent in combat
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Swords className="h-4 w-4" />
              <AlertDescription>
                {!combatResult 
                  ? `Prepare for encounter ${currentEncounter}. The difficulty increases with each level.`
                  : isPlayerWinner
                    ? 'Victory! You can proceed to the next encounter or replay this one.'
                    : 'Defeat. Try again to improve your skills and earn points.'
                }
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button
                onClick={handleStartEncounter}
                disabled={resolveStoryModeCombat.isPending}
                className="flex-1"
              >
                {resolveStoryModeCombat.isPending 
                  ? 'Fighting...' 
                  : combatResult 
                    ? 'Retry Encounter' 
                    : 'Start Encounter'
                }
              </Button>

              {combatResult && isPlayerWinner && (
                <Button
                  onClick={handleNextEncounter}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  Next Encounter
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
