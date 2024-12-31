<template>
  <div>
    <h1>Game Over</h1>
    <p>Winner: <strong>{{ props.winner }}</strong></p>
    <p>Thank you for playing UNO!</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ winner: string }>();
</script>

