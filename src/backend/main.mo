import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import Map "mo:core/Map";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Admin Access control state from the authorization component
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profiles required by frontend
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public type CombatResult = {
    winner : Principal;
    winnerHealth : Int;
    loser : Principal;
    rounds : Nat;
  };

  // Rank system
  public type Rank = {
    id : Nat;
    name : Text;
    requiredPoints : Nat;
  };

  let ranks = Map.empty<Nat, Rank>();
  ranks.add(1, { id = 1 : Nat; name = "Rookie"; requiredPoints = 0 : Nat });
  ranks.add(2, { id = 2; name = "Apprentice"; requiredPoints = 200 });
  ranks.add(3, { id = 3; name = "Warrior"; requiredPoints = 350 });
  ranks.add(4, { id = 4; name = "Veteran"; requiredPoints = 500 });
  ranks.add(5, { id = 5; name = "Elite"; requiredPoints = 700 });
  ranks.add(6, { id = 6; name = "Champion"; requiredPoints = 950 });
  ranks.add(7, { id = 7; name = "Warlord"; requiredPoints = 1200 });
  ranks.add(8, { id = 8; name = "Auswärtige"; requiredPoints = 1513 });
  ranks.add(9, { id = 9; name = "Monopoly"; requiredPoints = 2000 });
  ranks.add(10, { id = 10; name = "Cmd. Capital"; requiredPoints = 5000 });
  ranks.add(11, { id = 11; name = "Legendary"; requiredPoints = 14000 });
  ranks.add(12, { id = 12; name = "Kitchen Invader"; requiredPoints = 100000 });
  ranks.add(13, { id = 13; name = "The Chef"; requiredPoints = 700000 });

  // Player leaderboard and stats
  public type PlayerStats = {
    points : Nat;
    currentRankId : Nat;
    gamesPlayed : Nat;
    highestRank : Nat;
    highestPointBalance : Nat;
  };

  module PlayerStats {
    public func compare(stats1 : (Principal, PlayerStats), stats2 : (Principal, PlayerStats)) : Order.Order {
      // Compare based on points in descending order
      switch (Nat.compare(stats2.1.points, stats1.1.points)) {
        case (#equal) {
          stats1.0.toText().compare(stats2.0.toText());
        };
        case (order) { order };
      };
    };
  };

  public query func getRankForPoints(points : Nat) : async Rank {
    let allRanks = ranks.toArray();
    for (rank in allRanks.values().reverse()) {
      if (points >= rank.1.requiredPoints) {
        return rank.1;
      };
    };
    Runtime.trap("No rank found for points " # points.toText() # ". Must always find at least one rank");
  };

  public query func pointsToRankId(points : Nat) : async Nat {
    let sortedRanks = ranks.toArray();
    var currentRankId = 1;
    for (rank in sortedRanks.values()) {
      if (points >= rank.1.requiredPoints) {
        currentRankId := rank.1.id;
      };
    };
    currentRankId;
  };

  public query func getAllRanks() : async [Rank] {
    ranks.values().toArray();
  };

  // Global leaderboards - accessible to all including guests
  public query func getLeaderboard(count : Nat) : async [(Principal, PlayerStats)] {
    let allEntries = playerStats.toArray();
    let sortedEntries = allEntries.sort();
    let size = sortedEntries.size();
    if (count >= size) { return sortedEntries };
    Array.tabulate<(Principal, PlayerStats)>(count, func(i) { sortedEntries[i] });
  };

  // Points & results tracking, points only for signed in users
  public shared query ({ caller }) func getMyStats() : async PlayerStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their stats");
    };
    switch (playerStats.get(caller)) {
      case (null) {
        { points = 0; currentRankId = 1; gamesPlayed = 0; highestRank = 1; highestPointBalance = 1 };
      };
      case (?stats) { stats };
    };
  };

  // Track active matches to prevent result manipulation
  public type MatchState = {
    id : Text;
    player1 : Principal;
    player2 : Principal;
    createdBy : Principal;
  };

  // NEW: Queue for random matchmaking
  let matchmakingQueue = List.empty<Principal>();
  let activeMatches = Map.empty<Text, MatchState>();
  var matchIdCounter : Nat = 0;

  // Random matchmaking function
  public shared ({ caller }) func findMatch(startSolo : Bool) : async ?MatchState {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can start matchmaking");
    };

    // Find *and* dequeue scenario (reflected in queue length), after match is created.
    let queueArray = matchmakingQueue.toArray();

    switch (queueArray.findIndex(func(entry) { entry == caller })) {
      // Return right away to not create duplicates if already in queue & have not found a match yet.
      case (?_) {
        if (not startSolo) {
          return null; // Explicitly not found, so waiting is handled more gracefully in the UI.
        } else {
          // Solo scenario, so ignore queue and create fake match for actual caller to advance.
          let soloFakeMatch = {
            id = "solo-fake-match";
            player1 = caller;
            player2 = caller;
            createdBy = caller;
          };
          return ?soloFakeMatch;
        };
      };
      // Not in queue, add and return (and return right away for ranked, so user can switch to new game).
      case (null) {
        // If queue is not empty, create match with opponent.
        if (queueArray.size() > 0) {
          let opponent = queueArray[0];
          matchmakingQueue.clear();

          if (opponent == caller) {
            Runtime.trap("You need a new random opponent. Please try again after an opponent joins the queue.");
          };

          // Create a new match with a unique match ID.
          matchIdCounter += 1;
          let matchId = "match_" # matchIdCounter.toText();
          let newMatch = {
            id = matchId;
            player1 = caller;
            player2 = opponent;
            createdBy = caller;
          };

          // Add the new match and return it to both participants
          activeMatches.add(matchId, newMatch);
          return ?newMatch;
        } else {
          // No opponent is available, queue the caller as a challenger and return nothing (for UI spinner).
          matchmakingQueue.add(caller);
          return null;
        };
      };
    };
  };

  // Only valid scores must be accepted, no cheating scenarios
  // Only the actual participants can submit results for their match
  public shared ({ caller }) func submitResult(matchId : Text, winner : Principal, loser : Principal, winningPoints : Nat, losingPoints : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit results");
    };

    // Verify match exists and caller is a participant
    let matchState = switch (activeMatches.get(matchId)) {
      case (null) { Runtime.trap("Match not found or already completed") };
      case (?state) { state };
    };

    if (caller != matchState.player1 and caller != matchState.player2) {
      Runtime.trap("Unauthorized: Only match participants can submit results");
    };

    // Validate that winner and loser are the actual participants
    if ((winner != matchState.player1 and winner != matchState.player2) or
        (loser != matchState.player1 and loser != matchState.player2)) {
      Runtime.trap("Winner and loser must be the match participants");
    };

    // Validate submissions
    if (winner == loser) {
      Runtime.trap("A user cannot be both the winner and the loser");
    };
    if (winningPoints <= losingPoints) {
      Runtime.trap("Winning points must be higher than losing points");
    };
    if (winningPoints < 1 or winningPoints > 1000 or losingPoints >= 1000) {
      Runtime.trap("Points must be within 1-1000 for winners and 0-999 for losers");
    };
    if (winningPoints - losingPoints > 999) {
      Runtime.trap("The spread between winner and loser cannot exceed 999 points");
    };

    // Adjust/remove points if already exist
    func adjustPoints(player : Principal, achievedPoints : Nat) : async () {
      let current = playerStats.get(player);
      switch (current) {
        case (null) {
          let newRankId = await pointsToRankId(achievedPoints);
          playerStats.add(
            player,
            {
              points = achievedPoints;
              currentRankId = newRankId;
              gamesPlayed = 1;
              highestRank = newRankId;
              highestPointBalance = achievedPoints;
            },
          );
        };
        case (?existing) {
          let newPoints = existing.points + achievedPoints;
          let newRankId = await pointsToRankId(newPoints);
          playerStats.add(
            player,
            {
              points = newPoints;
              currentRankId = newRankId;
              gamesPlayed = existing.gamesPlayed + 1;
              highestRank = if (newRankId > existing.highestRank) { newRankId } else {
                existing.highestRank : Nat;
              };
              highestPointBalance = if (newPoints > existing.highestPointBalance) {
                newPoints : Nat;
              } else { existing.highestPointBalance : Nat };
            },
          );
        };
      };
    };

    await adjustPoints(winner, winningPoints);

    if (losingPoints > 0) {
      await adjustPoints(loser, losingPoints);
    };

    // Remove match from active matches to prevent duplicate submissions
    activeMatches.remove(matchId);
  };

  // Gated purchases for paid game mode
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;
  let purchasedAccess = Map.empty<Principal, Bool>();

  // Track pending payment sessions to verify completion
  let pendingSessions = Map.empty<Text, Principal>();

  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  // Restore this function because Stripe needs to parse configuration from admin
  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  // Keep this function for Stripe only
  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfiguration := ?config;
  };

  // Keep this function for Stripe only
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check session status");
    };

    // Verify the session belongs to the caller or caller is admin
    switch (pendingSessions.get(sessionId)) {
      case (?owner) {
        if (owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only check your own session status");
        };
      };
      case (null) {
        // Session not tracked, only allow admins
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Session not found or access denied");
        };
      };
    };

    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };

    let sessionId = await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);

    // Track this session for the caller
    pendingSessions.add(sessionId, caller);

    sessionId;
  };

  public shared ({ caller }) func createGamePurchaseSession(successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create purchase sessions");
    };

    let items = [
      {
        currency = "usd";
        productName = "Game unlock";
        productDescription = "Unlock paid mode of the game";
        priceInCents = 399;
        quantity = 1;
      },
    ];
    let sessionId = await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);

    // Track this session for the caller
    pendingSessions.add(sessionId, caller);

    sessionId;
  };

  public shared ({ caller }) func unlockWithPurchase(sessionId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlock with purchase");
    };

    let status = await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
    switch (status) {
      case (#completed _) {
        purchasedAccess.add(caller, true);
      };
      case (#failed _) {
        Runtime.trap("Checkout status failed");
      };
    };
  };

  // Check if user has purchased access to paid game mode
  public shared query ({ caller }) func hasPurchasedAccess() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check purchase status");
    };
    switch (purchasedAccess.get(caller)) {
      case (null) { false };
      case (?access) { access };
    };
  };

  let playerStats = Map.empty<Principal, PlayerStats>();
};
