<template>
  <!-- Navigation -->
  <div v-if="!inGame">
    <button @click="view = 'create'" :disabled="view === 'create'">Create Game</button>
    <button @click="view = 'join'" :disabled="view === 'join'">Join Game</button>
  </div>

  <div id="app">
    <CreateGame
        v-if="view === 'create'"
        @game-created="handleGameCreated"
        @game-started="handleGameStarted"
    />
    <JoinGame
        v-if="view === 'join'"
        @game-joined="handleGameJoined"
    />
    <Lobby
        v-if="view === 'lobby'"
        @game-started="handleGameStarted"
    />
    <Gameboard v-if="view === 'gameboard'" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CreateGame from './components/CreateGame.vue';
import JoinGame from './components/JoinGame.vue';
import Lobby from './components/Lobby.vue';
import Gameboard from './components/Gameboard.vue';

// State for managing views
const view = ref<'create' | 'join' | 'lobby' | 'gameboard'>('create');
const inGame = ref(false);

// Handlers
const handleGameCreated = () => {
  console.log('Game created! Transitioning to lobby.');
  view.value = 'lobby';
  inGame.value = true;
};

const handleGameJoined = () => {
  console.log('Game joined! Transitioning to lobby.');
  view.value = 'lobby';
  inGame.value = true;
};

const handleGameStarted = () => {
  console.log('Game started! Transitioning to gameboard.');
  view.value = 'gameboard';
};
</script>

