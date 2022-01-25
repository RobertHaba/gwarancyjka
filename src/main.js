import { createApp } from 'vue'
import store from './store/index'
import App from './App.vue'
import router from "./router";
require('@/assets/styles/style.css')
createApp(App).use(router).use(store).mount('#app')
