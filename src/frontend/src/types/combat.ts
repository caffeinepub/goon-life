import type { Principal } from '@dfinity/principal';

export interface CombatResult {
  winner: Principal;
  winnerHealth: bigint;
  loser: Principal;
  rounds: bigint;
}
