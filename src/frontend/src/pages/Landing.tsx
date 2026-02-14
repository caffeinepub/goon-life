import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Swords, BookOpen, Trophy, Zap } from 'lucide-react';
import ProfileSetupDialog from '../components/ProfileSetupDialog';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <>
      <ProfileSetupDialog />
      <div className="relative min-h-[calc(100vh-8rem)]">
        {/* Hero Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: 'url(/assets/generated/goon-life-hero-bg.dim_1920x1080.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />

        {/* Content */}
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img 
                src="/assets/generated/goon-life-logo.dim_1024x256.png" 
                alt="Goon Life" 
                className="h-24 w-auto"
              />
            </div>

            {/* Tagline */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Choose Your <span className="text-primary glow-text">Battle</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Compete in online multiplayer or unlock the epic story mode. Rise through the ranks and become the greatest goon.
              </p>
            </div>

            {/* Mode Cards */}
            <div className="grid md:grid-cols-2 gap-6 mt-12">
              {/* Online Multiplayer */}
              <Card className="border-primary/30 hover:border-primary/60 transition-all hover:shadow-glow cursor-pointer group" onClick={() => navigate({ to: '/multiplayer' })}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                      <Swords className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Online Multiplayer</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    Free to play • Compete globally
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">
                    Challenge players worldwide in asynchronous battles. Create matches, submit results, and climb the leaderboard.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-accent">
                    <Zap className="h-4 w-4" />
                    <span className="font-medium">Always Free</span>
                  </div>
                </CardContent>
              </Card>

              {/* Story Mode */}
              <Card className="border-secondary/30 hover:border-secondary/60 transition-all hover:shadow-glow cursor-pointer group" onClick={() => navigate({ to: '/story-mode' })}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-lg bg-secondary/20 group-hover:bg-secondary/30 transition-colors">
                      <BookOpen className="h-6 w-6 text-secondary" />
                    </div>
                    <CardTitle className="text-2xl">Goon Fighter</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    Story Mode • One-time purchase
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">
                    Unlock the epic story campaign and experience the full Goon Fighter saga. Premium content awaits.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-secondary">
                    <Trophy className="h-4 w-4" />
                    <span className="font-medium">$3.99 One-Time</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="pt-8">
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate({ to: '/leaderboard' })}
                className="gap-2"
              >
                <Trophy className="h-5 w-5" />
                View Global Leaderboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
