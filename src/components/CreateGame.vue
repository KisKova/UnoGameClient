<template>
  <div>
    <h1>Create a New Game</h1>
    <div v-if="!gameStore.gameId">
      <input
          v-model="playerName"
          type="text"
          placeholder="Enter your name"
      />
      <button @click="createGame" :disabled="!playerName">
        Create Game
      </button>
    </div>
    <div v-if="gameStore.gameId">
      <h2>Game Created!</h2>
      <p>Game ID: <strong>{{ gameStore.gameId }}</strong></p>
      <h3>Players:</h3>
      <ul>
        <li v-for="player in gameStore.players" :key="player.id">{{ player.name }}</li>
      </ul>
      <p v-if="gameStore.players.length < 2" style="color: red">Waiting for players to join...</p>
      <button
          v-if="gameStore.players.length >= 2"
          @click="startGame"
      >
        Start Game
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import socket from './socket.ts'; // Shared socket instance
import { useGameStore } from '../stores/gameStore';

const gameStore = useGameStore();
const playerName = ref('');
const emit = defineEmits(['game-started']);

// Function to create a new game
const createGame = () => {
  console.log('Creating game with player name:', playerName.value);

  socket.emit('create-game', { playerName: playerName.value });

  socket.on('game-created', (data: { gameId: string; players: { id: string; name: string }[] }) => {
    console.log('Game created:', data);
    gameStore.setGameId(data.gameId); // Save the game ID
    gameStore.players = data.players; // Save the player list
  });

  socket.on('error', (data: { message: string }) => {
    console.error('Error:', data.message);
  });
};

// Function to start the game
const startGame = () => {
  console.log('Starting the game...');
  socket.emit('start-game', { gameId: gameStore.gameId });
};

// Listen for events
onMounted(() => {
  socket.on('player-joined', (data: { players: { id: string; name: string }[] }) => {
    console.log('Player joined:', data.players);
    gameStore.players = data.players; // Update player list
  });

  socket.on('game-started', (data) => {
    console.log(`Game started:`, data);
    emit('game-started'); // Transition to GameBoard
  });
});

// Clean up listeners on unmount
onUnmounted(() => {
  socket.off('player-joined');
  socket.off('game-started');
});
</script>

