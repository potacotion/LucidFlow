// main.js / main.ts
import '@fortawesome/fontawesome-free/css/all.css'
import '@/styles/index.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { OpenAPI } from '@/api'

import App from './App.vue'
import router from './router'
import Toast, { type PluginOptions } from "vue-toastification";
import "vue-toastification/dist/index.css";
import { setupTooltipDirective } from '@/directives/tooltip'

OpenAPI.BASE = 'http://localhost:3000';

const app = createApp(App)

const options: PluginOptions = {
    // You can set your default options here
};

app.use(createPinia())
app.use(router)
app.use(Toast, options);
setupTooltipDirective(app)

app.mount('#app')
