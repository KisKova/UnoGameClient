import { defineStore } from 'pinia';

export interface Player {
    id: string;
    name: string;
}

export interface GameState {
    gameId: string;
    players: Player[];
}

export const useGameStore = defineStore('game', {
    state: (): GameState => ({
        gameId: '', // Default as an empty string
        players: [], // Default as an empty array
    }),
    actions: {
        setGameId(id: string) {
            this.gameId = id;
        },
        addPlayer(player: Player) {
            this.players.push(player);
        },
        setPlayers(players: Player[]) {
            this.players = players;
        },
    },
});
