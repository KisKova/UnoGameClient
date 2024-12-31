<template>
  <div>
    <h1>Game Board</h1>
    <p>Game ID: <strong>{{ gameStore.gameId }}</strong></p>
    <h2>Players:</h2>
    <ul>
      <li v-for="player in gameStore.players" :key="player.id">{{ player.name }}</li>
    </ul>
    <p v-if="turnPlayer">It's <strong>{{ turnPlayer }}</strong>'s turn!</p>
    <p v-else>Game is setting up...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
//import { io } from 'socket.io-client';
import socket from './socket.ts';
import { useGameStore } from '../stores/gameStore';

//const socket = io('http://localhost:3000'); // Replace with your server's URL
const gameStore = useGameStore();

// Track the current turn player
const turnPlayer = ref<string | null>(null);

// Listen for game state updates
onMounted(() => {
  socket.on('game-updated', (data) => {
    console.log('Game state updated:', data);
    turnPlayer.value = data.currentTurn; // Example: Update the current turn player
    // Add additional state handling here
  });

  // Handle disconnections or errors
  socket.on('error', (data: { message: string }) => {
    console.error('Error:', data.message);
  });
});

onUnmounted(() => {
  socket.off('game-updated');
  socket.off('error');
});
</script>
