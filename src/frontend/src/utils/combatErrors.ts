export function normalizeCombatError(error: any): string {
  const errorMessage = error?.message || error?.toString() || 'Unknown error';
  
  // Matchmaking errors
  if (errorMessage.includes('already in the queue')) {
    return 'You are already in the multiplayer queue. Please wait for an opponent to join.';
  }
  
  if (errorMessage.includes('need a new random opponent')) {
    return 'No opponents available right now. Please try again in a moment.';
  }
  
  // Common combat error patterns
  if (errorMessage.includes('not a participant') || errorMessage.includes('not found')) {
    return 'You are not a participant in this match. Please check the match ID.';
  }
  
  if (errorMessage.includes('already completed') || errorMessage.includes('already finalized')) {
    return 'This combat has already been completed. You cannot resolve it again.';
  }
  
  if (errorMessage.includes('invalid session') || errorMessage.includes('invalid match')) {
    return 'Invalid match or session ID. Please verify and try again.';
  }
  
  if (errorMessage.includes('Unauthorized')) {
    return 'You must be logged in to participate in combat.';
  }
  
  if (errorMessage.includes('Actor not available')) {
    return 'Connection to the game server is not available. Please refresh and try again.';
  }
  
  // Return the original message if no pattern matches
  return errorMessage;
}
