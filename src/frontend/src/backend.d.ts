import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface PlayerStats {
    gamesPlayed: bigint;
    currentRankId: bigint;
    highestRank: bigint;
    highestPointBalance: bigint;
    points: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface Rank {
    id: bigint;
    name: string;
    requiredPoints: bigint;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface MatchState {
    id: string;
    createdBy: Principal;
    player1: Principal;
    player2: Principal;
}
export interface UserProfile {
    name: string;
}
export interface http_header {
    value: string;
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createGamePurchaseSession(successUrl: string, cancelUrl: string): Promise<string>;
    findMatch(startSolo: boolean): Promise<MatchState | null>;
    getAllRanks(): Promise<Array<Rank>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLeaderboard(count: bigint): Promise<Array<[Principal, PlayerStats]>>;
    getMyStats(): Promise<PlayerStats>;
    getRankForPoints(points: bigint): Promise<Rank>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasPurchasedAccess(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    pointsToRankId(points: bigint): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    submitResult(matchId: string, winner: Principal, loser: Principal, winningPoints: bigint, losingPoints: bigint): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    unlockWithPurchase(sessionId: string): Promise<void>;
}
