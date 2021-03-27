<template>
  <div id="app">
    <world />
  </div>
</template>

<script>
import Vue from 'vue'

import { firestorePlugin } from 'vuefire'
Vue.use(firestorePlugin)

import Vue2TouchEvents from 'vue2-touch-events'
Vue.use(Vue2TouchEvents, {
  // swipeTolerance: 100,
})

import Player from './components/Player.vue'
Vue.component('player', Player)

import Maze from './components/Maze.vue'
Vue.component('maze', Maze)

import World from './components/World.vue'
Vue.component('world', World)

import Controls from './components/Controls.vue'
Vue.component('controls', Controls)

export default {
  name: 'app',
}
</script>

<style lang="scss">
body {
  padding: 0;
  margin: 0;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
}
</style>
