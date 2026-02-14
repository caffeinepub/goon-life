import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
import type { Rank } from '../backend';

interface RankBadgeProps {
  rank: Rank;
  points: bigint;
  size?: 'sm' | 'md' | 'lg';
}

export default function RankBadge({ rank, points, size = 'md' }: RankBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <div className="flex flex-col gap-2">
      <Badge variant="outline" className={`${sizeClasses[size]} gap-2 w-fit border-primary/50 bg-primary/10`}>
        <Trophy className="h-3 w-3 text-primary" />
        <span className="font-bold text-primary">{rank.name}</span>
      </Badge>
      <div className="text-xs text-muted-foreground">
        {points.toString()} points
      </div>
    </div>
  );
}
