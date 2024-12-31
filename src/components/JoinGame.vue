<template>
  <div>
    <h1>Join a Game</h1>
    <div v-if="!joined">
      <input v-model="playerName" placeholder="Enter your name" />
      <input v-model="gameId" placeholder="Enter Game ID" />
      <button @click="joinGame" :disabled="!playerName || !gameId">Join Game</button>
    </div>
    <p v-if="error" style="color: red">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
//import { io } from 'socket.io-client';
import { useGameStore } from '../stores/gameStore';
import socket from './socket.ts';

//const socket = io('http://localhost:3000'); // Adjust to your server's URL
const gameStore = useGameStore();

const playerName = ref('');
const gameId = ref('');
const error = ref('');
const joined = ref(false); // Controls whether the player has joined a game

const emit = defineEmits(['game-joined']);

const joinGame = () => {
  error.value = ''; // Clear any previous errors

  console.log('Attempting to join game:', { playerName: playerName.value, gameId: gameId.value });

  socket.emit('join-game', { gameId: gameId.value, playerName: playerName.value });

  // Listen for successful join
  socket.on('player-joined', (data: { players: { id: string; name: string }[] }) => {
    console.log('Received player-joined:', data.players);
    gameStore.setGameId(gameId.value); // Update the game ID in the store
    gameStore.players = data.players; // Update the player list in the store
    joined.value = true; // Hide the input fields and button
    emit('game-joined'); // Notify App.vue to transition to the Lobby
  });

  // Listen for errors
  socket.on('error', (data: { message: string }) => {
    error.value = data.message;
    console.error('Error:', data.message);
  });
};
</script>
