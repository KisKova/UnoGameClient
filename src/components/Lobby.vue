<template>
  <div>
    <h1>Game Lobby</h1>
    <p>Game ID: <strong>{{ gameStore.gameId }}</strong></p>
    <h2>Players:</h2>
    <ul>
      <li v-for="player in gameStore.players" :key="player.id">{{ player.name }}</li>
    </ul>

    <h2>Debug Info:</h2>
    <p>Socket ID: <strong>{{ socket.id }}</strong></p>
    <p>Player Count: <strong>{{ gameStore.players.length }}</strong></p>
    <p v-if="gameStore.players.length === 0" style="color: red">
      No players have joined yet.
    </p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import socket from './socket.ts'; // Shared socket instance
import { useGameStore } from '../stores/gameStore';

const gameStore = useGameStore();
const emit = defineEmits(['game-started']);

// Listen for events
onMounted(() => {
  console.log('Lobby mounted for game ID:', gameStore.gameId);

  socket.on('player-joined', (data: { players: { id: string; name: string }[] }) => {
    console.log('Player joined event in Lobby:', data.players);
    gameStore.players = data.players; // Update player list
  });

  socket.on('game-started', (data) => {
    console.log(`Game started event in Lobby:`, data);
    emit('game-started'); // Transition to GameBoard
  });
});

// Clean up listeners on unmount
onUnmounted(() => {
  socket.off('player-joined');
  socket.off('game-started');
});
</script>

