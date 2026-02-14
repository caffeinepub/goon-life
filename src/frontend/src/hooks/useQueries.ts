import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, Rank, PlayerStats, StripeConfiguration, MatchState } from '../backend';
import type { CombatResult } from '../types/combat';
import { Principal } from '@dfinity/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Rank Queries
export function useGetAllRanks() {
  const { actor, isFetching } = useActor();

  return useQuery<Rank[]>({
    queryKey: ['ranks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRanks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRankForPoints() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (points: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getRankForPoints(points);
    },
  });
}

// Player Stats Queries
export function useGetMyStats() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<PlayerStats>({
    queryKey: ['myStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMyStats();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

// Leaderboard Queries
export function useGetLeaderboard() {
  const { actor, isFetching } = useActor();

  return useQuery<[Principal, PlayerStats][]>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard(BigInt(100));
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// Matchmaking Queries
export function useFindMatch() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (startSolo: boolean): Promise<MatchState | null> => {
      if (!actor) throw new Error('Actor not available');
      return actor.findMatch(startSolo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myStats'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}

// Match Queries
export function useSubmitResult() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      winner,
      loser,
      winningPoints,
      losingPoints,
    }: {
      matchId: string;
      winner: Principal;
      loser: Principal;
      winningPoints: bigint;
      losingPoints: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitResult(matchId, winner, loser, winningPoints, losingPoints);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myStats'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}

// Combat Queries
export function useResolveCombat() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchId: string): Promise<CombatResult> => {
      if (!actor) throw new Error('Actor not available');
      // Type assertion needed until backend interface is regenerated
      const actorWithCombat = actor as any;
      if (!actorWithCombat.resolveCombat) {
        throw new Error('Combat system not yet deployed. Please contact administrator.');
      }
      return actorWithCombat.resolveCombat(matchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myStats'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}

export function useResolveStoryModeCombat() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (encounterLevel: bigint): Promise<CombatResult> => {
      if (!actor) throw new Error('Actor not available');
      // Type assertion needed until backend interface is regenerated
      const actorWithCombat = actor as any;
      if (!actorWithCombat.resolveStoryModeCombat) {
        throw new Error('Story mode combat not yet deployed. Please contact administrator.');
      }
      return actorWithCombat.resolveStoryModeCombat(encounterLevel);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myStats'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}

// Purchase & Entitlement Queries
export function useHasPurchasedAccess() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['purchasedAccess'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.hasPurchasedAccess();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useCreateGamePurchaseSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ successUrl, cancelUrl }: { successUrl: string; cancelUrl: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createGamePurchaseSession(successUrl, cancelUrl);
    },
  });
}

export function useGetStripeSessionStatus() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getStripeSessionStatus(sessionId);
    },
  });
}

export function useUnlockWithPurchase() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unlockWithPurchase(sessionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchasedAccess'] });
    },
  });
}

// Stripe Configuration
export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
    },
  });
}
