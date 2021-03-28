import { createApp, h } from 'vue'

import App from './App.vue'

import Player from './components/Player.vue'
import Maze from './components/Maze.vue'
import World from './components/World.vue'
import Controls from './components/Controls.vue'

const app = createApp({
  render: () => h(App),
})

app.component('player', Player)
app.component('maze', Maze)
app.component('world', World)
app.component('controls', Controls)

// Vue.config.productionTip = false

app.mount('#app')

