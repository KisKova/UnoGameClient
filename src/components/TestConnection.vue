<template>
  <div>
    <h1>Test Connection</h1>
    <button @click="connectToServer">Connect to Server</button>
    <p v-if="connected">Connected to Server!</p>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { io } from 'socket.io-client';

const connected = ref(false);
const message = ref('');
const socket = io('http://localhost:3000'); // Replace with your server URL

// Handle connection status
socket.on('connect', () => {
  connected.value = true;
  console.log('Connected to server!');
});

socket.on('disconnect', () => {
  connected.value = false;
  console.log('Disconnected from server.');
});

// Handle custom messages from the server
socket.on('server-message', (data) => {
  message.value = data;
  console.log('Message from server:', data);
});

// Emit a test event to the server
const connectToServer = () => {
  socket.emit('test-event', { message: 'Hello, server!' });
};
</script>
