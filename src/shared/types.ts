// Shared Game Types

export type Color = 'RED' | 'GREEN' | 'BLUE' | 'YELLOW';

export type Type = 'NUMBERED' | 'SKIP' | 'REVERSE' | 'DRAW' | 'WILD' | 'WILD DRAW';

export interface Card {
    type: Type;
    color?: Color; // Some cards (e.g., WILD) may not have a color
    number?: number; // Numbered cards
}

export interface Deck {
    cards: Card[];
    size: number;
}

export interface Hand {
    playerCount: number;
    dealer: number;
    drawPile: Deck;
    discardPile: Deck;
    gameEnded: boolean;
    playerInTurn: number;
    playerHands: Card[][]; // Array of card arrays, one per player
}

export interface Game {
    playerCount: number;
    targetScore: number;
    currentHand: Hand;
    scores: number[]; // Scores of all players
    players: { id: string; name: string }[]; // Players' info
}
