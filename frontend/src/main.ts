import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import './assets/main.css'

// Vant 组件按需引入
import { Field, Popup, Picker, Button, Stepper, Switch, Cell, CellGroup, Toast } from 'vant'
import 'vant/lib/index.css'

const app = createApp(App)
app.use(Field).use(Popup).use(Picker).use(Button).use(Stepper).use(Switch).use(Cell).use(CellGroup).use(Toast)
app.use(createPinia()).use(router).mount('#app')
