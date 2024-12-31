import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

const app = createApp(App);

// Create a Pinia instance
const pinia = createPinia();

// Use the Pinia instance in your Vue app
app.use(pinia);

app.mount('#app');
