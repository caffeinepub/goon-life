import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useGetLeaderboard, useGetAllRanks } from '../hooks/useQueries';
import { Trophy, Medal, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useGetLeaderboard();
  const { data: ranks } = useGetAllRanks();

  const getRankForPoints = (points: bigint) => {
    if (!ranks) return null;
    let currentRank = ranks[0];
    for (const rank of ranks) {
      if (points >= rank.requiredPoints) {
        currentRank = rank;
      }
    }
    return currentRank;
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-primary" />;
      case 2:
        return <Medal className="h-5 w-5 text-muted-foreground" />;
      case 3:
        return <Award className="h-5 w-5 text-secondary" />;
      default:
        return null;
    }
  };

  const shortenPrincipal = (principal: string) => {
    if (principal.length <= 16) return principal;
    return `${principal.slice(0, 8)}...${principal.slice(-8)}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            <Trophy className="h-8 w-8 text-primary" />
            Global Leaderboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Top players ranked by total points
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top 100 Players</CardTitle>
            <CardDescription>
              Compete to reach the top of the leaderboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : !leaderboard || leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No players on the leaderboard yet. Be the first to compete!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Rank</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Title</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.map(([principal, stats], index) => {
                      const position = index + 1;
                      const rank = getRankForPoints(stats.points);
                      const icon = getPositionIcon(position);

                      return (
                        <TableRow key={principal.toString()}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {icon || <span className="text-muted-foreground">#{position}</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {shortenPrincipal(principal.toString())}
                            </code>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-primary">
                              {stats.points.toString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            {rank && (
                              <Badge variant="outline" className="border-primary/50 bg-primary/10">
                                {rank.name}
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
