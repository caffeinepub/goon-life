import { Link, useNavigate } from '@tanstack/react-router';
import { Trophy, Swords, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoginButton from './LoginButton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';

export default function AppHeader() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/assets/generated/goon-life-logo.dim_1024x256.png" 
              alt="Goon Life" 
              className="h-8 w-auto"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/multiplayer' })}
              className="gap-2"
            >
              <Swords className="h-4 w-4" />
              Multiplayer
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/story-mode' })}
              className="gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Story Mode
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/leaderboard' })}
              className="gap-2"
            >
              <Trophy className="h-4 w-4" />
              Leaderboard
            </Button>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated && userProfile && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{userProfile.name}</span>
              </div>
            )}
            <LoginButton />
          </div>
        </div>
      </div>
    </header>
  );
}
