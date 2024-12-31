<template>
  <div class="game-board">
    <h1 class="title">UNO Game Board</h1>

    <!--Scoreboard-->
    <div class="scoreboard">
      <h2>Scoreboard</h2>
      <table>
        <thead>
        <tr>
          <th>Player</th>
          <th>Score</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(player, index) in players" :key="index">
          <td>{{ player.name }}</td>
          <td>{{ scores[index] }}</td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Current Turn -->
    <p class="current-turn">
      Current Turn: <strong>{{ players[playerInTurn]?.name }}</strong>
    </p>

    <!-- Top Card -->
    <div class="top-card">
      <p>
        Top Card:
        <span :style="{ color: topCard?.color || 'black' }">
          {{ topCardDisplay }}
        </span>
      </p>
    </div>

    <!-- Player Hands -->
    <div class="player-hands">
      <h2>Player Hands</h2>
      <ul>
        <li v-for="(hand, index) in playerHands" :key="index">
          {{ players[index]?.name }}: {{ hand.length }} cards
        </li>
      </ul>
    </div>

    <!-- Your Hand -->
    <div class="your-hand">
      <h2>Your Hand</h2>
      <div class="card-container">
        <button
            v-for="(card, index) in playerHands[myIndex]"
            :key="index"
            @click="playCard(index)"
            :disabled="playerInTurn !== myIndex"
            :style="{ color: card.color }"
            class="card"
        >
          {{ card.type }} {{ card.number || '' }}
        </button>
      </div>
    </div>

    <!-- Color Selection Modal -->
    <div v-if="showColorModal" class="modal">
      <div class="modal-content">
        <h2>Select a Color</h2>
        <div class="color-options">
          <button
              v-for="color in availableColors"
              :key="color"
              @click="selectColor(color)"
              :style="{ backgroundColor: color.toLowerCase(), color: 'white' }"
          >
            {{ color }}
          </button>
        </div>
        <button class="modal-cancel" @click="cancelColorSelection">Cancel</button>
      </div>
    </div>

    <!-- Actions -->
    <div class="actions">
      <button class="action-btn" @click="drawCard" :disabled="playerInTurn !== myIndex">
        Draw Card
      </button>
      <button class="action-btn" v-if="playerHands[myIndex]?.length === 1 && !unoCalled" @click="callUno">
        Call UNO!
      </button>
      <button class="action-btn" @click="showAccuseModal = true">Accuse Player</button>
    </div>

    <!-- Modal for Accusing -->
    <div v-if="showAccuseModal" class="modal">
      <div class="modal-content">
        <h2>Select a Player to Accuse</h2>
        <ul>
          <li
              v-for="player in playersToAccuse"
              :key="player.id"
              @click="accusePlayer(player.id)"
              class="player-option"
          >
            {{ player.name }}
          </li>
        </ul>
        <button class="modal-cancel" @click="showAccuseModal = false">Cancel</button>
      </div>
    </div>

    <!-- Draw Pile and Discard Pile -->
    <div class="piles">
      <p>Draw Pile: {{ drawPile }} cards remaining</p>
      <h3>Discard Pile</h3>
      <ul>
        <li
            v-for="(card, index) in discardPile"
            :key="index"
            :style="{ color: card.color }"
            class="discard-card"
        >
          {{ card.type }} {{ card.number || '' }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import socket from './socket.ts';
import { useGameStore } from '../stores/gameStore';

// Define Card and related types locally
type Color = 'RED' | 'GREEN' | 'BLUE' | 'YELLOW';
type Type = 'NUMBERED' | 'SKIP' | 'REVERSE' | 'DRAW' | 'WILD' | 'WILD DRAW';

interface Card {
  type: Type;
  color?: Color;
  number?: number;
}

// Reactive State
const gameStore = useGameStore();
const players = ref<{ id: string; name: string }[]>([]);
const playerInTurn = ref<number>(0);
const playerHands = ref<Card[][]>([]);
const drawPile = ref<number>(0);
const discardPile = ref<Card[]>([]);
const topCard = ref<Card | null>(null);
const myIndex = ref(0); // Index of the current player
const gameOver = ref(false);
//const winner = ref<number | null>(null);
const unoCalled = ref(false); // Track if the current player has called UNO
const showAccuseModal = ref(false); // Modal visibility state
const showColorModal = ref(false); // Control color selection modal
const selectedCardIndex = ref<number | null>(null); // Track the card being played
const availableColors: Color[] = ['RED', 'GREEN', 'BLUE', 'YELLOW'];
const scores = ref<number[]>([]);

const topCardDisplay = computed(() => {
  if (!topCard.value) return 'No card available';
  return `${topCard.value.type} ${topCard.value.number || ''}`;
});

// Filter players to exclude the current player
const playersToAccuse = computed(() =>
    players.value.filter((_, index) => index !== myIndex.value)
);

const callUno = () => {
  console.log('Calling UNO!');
  socket.emit('call-uno', {
    gameId: gameStore.gameId,
    playerId: socket.id,
  });
  unoCalled.value = true; // Mark the current player as having called UNO
};

const accusePlayer = (accusedId: string) => {
  console.log('Accusing player of failing to call UNO:', accusedId);
  socket.emit('catch-uno-failure', {
    gameId: gameStore.gameId,
    accuserId: socket.id,
    accusedId,
  });

  // Hide modal after accusation
  showAccuseModal.value = false;
};

// Event Handlers
const playCard = (index: number) => {
  const card = playerHands.value[myIndex.value][index];
  console.log('Attempting to play card:', card);

  if (card.type === 'WILD' || card.type === 'WILD DRAW') {
    selectedCardIndex.value = index; // Save the card index
    showColorModal.value = true; // Open the color selection modal
  } else {
    emitPlayCard(index);
  }
};

const drawCard = () => {
  console.log('Attempting to draw a card...');
  socket.emit('draw-card', {
    gameId: gameStore.gameId,
    playerId: socket.id,
  });
};

// Emit the play-card event
const emitPlayCard = (index: number, color?: Color) => {
  socket.emit('play-card', {
    gameId: gameStore.gameId,
    playerId: socket.id,
    cardIndex: index,
    color, // Include the selected color for wild cards
  });
  showColorModal.value = false; // Close the color modal if open
  selectedCardIndex.value = null; // Reset the selected card index
};

// Handle color selection
const selectColor = (color: Color) => {
  console.log('Color selected:', color);
  if (selectedCardIndex.value !== null) {
    emitPlayCard(selectedCardIndex.value, color);
  }
};

// Cancel color selection
const cancelColorSelection = () => {
  console.log('Color selection canceled');
  showColorModal.value = false;
  selectedCardIndex.value = null;
};

// Socket Event Listeners
onMounted(() => {
  socket.on('game-initialized', (state) => {
    console.log('Game initialized:', state);
    updateGameState(state);

    // Ensure `myIndex` is calculated after the state is updated
    myIndex.value = state.players.findIndex((p: any) => p.id === socket.id);
    console.log('My Index:', myIndex.value);
  });

  socket.on('game-updated', (state) => {
    console.log('Game updated:', state);
    updateGameState(state);
  });

  socket.on('hand-ended', (data) => {
    console.log('Hand ended:', data);
    alert(`The hand has ended! Winner: ${data.winner}`); // Temporary alert
  });

  socket.on('new-hand', (newHandState) => {
    console.log('New hand started:', newHandState);
    updateGameState(newHandState);
  });

  socket.on('game-ended', (data) => {
    console.log('Game ended:', data);
    const overallWinner = data.winner;
    alert(`The game has ended! Winner: ${overallWinner.name}`); // Replace with transition logic

    // Notify App.vue to transition to the GameOver view
    gameOver.value = true;
    socket.emit('transition-to-gameover', { winner: overallWinner.name });
  });
});

const updateGameState = (state: any) => {
  players.value = state.players || [];
  playerInTurn.value = state.playerInTurn || 0;
  playerHands.value = state.playerHands || [];
  drawPile.value = state.drawPile || 0;
  discardPile.value = state.discardPile || [];
  topCard.value = discardPile.value[discardPile.value.length - 1] || null;
  scores.value = state.scores || [];
};
</script>


<style scoped>
/* General Styles */
.game-board {
  font-family: 'Arial', sans-serif;
  color: #333;
  padding: 20px;
  max-width: 800px;
  margin: auto;
  background-color: #f2f2f2;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.title {
  font-size: 2rem;
  text-align: center;
  color: #ff0000;
  margin-bottom: 20px;
}

.scoreboard table {
  width: 100%;
  margin-bottom: 20px;
  border-collapse: collapse;
}

.scoreboard th,
.scoreboard td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;
}

.scoreboard th {
  background-color: #333;
  color: white;
}

/* Current Turn */
.current-turn {
  font-size: 1.2rem;
  margin: 15px 0;
}

/* Card Styles */
.card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.card {
  padding: 10px;
  font-size: 0.9rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  background-color: #fff;
  transition: transform 0.2s;
}

.card:hover {
  transform: scale(1.1);
}

.card:disabled {
  cursor: not-allowed;
  background-color: #ddd;
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.color-options button {
  width: 60px;
  height: 60px;
  border: none;
  border-radius: 50%;
  margin: 10px;
  font-size: 14px;
  cursor: pointer;
}

.modal-cancel {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: red;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

/* Actions */
.actions {
  margin: 20px 0;
  text-align: center;
}

.action-btn {
  margin: 5px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: #0056b3;
}

.action-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Piles */
.piles ul {
  list-style: none;
  padding: 0;
}

.discard-card {
  display: inline-block;
  margin: 5px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 0.9rem;
  background-color: white;
}

.player-option {
  cursor: pointer;
  margin: 10px 0;
  padding: 5px;
  background-color: #f4f4f4;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.player-option:hover {
  background-color: #e6e6e6;
}
</style>
