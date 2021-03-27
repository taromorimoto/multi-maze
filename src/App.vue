<template>
  <div id="app">
    <world />
  </div>
</template>

<script>
import Vue from 'vue'

import Player from './components/Player.vue'
Vue.component('Player', Player)

import Maze from './components/Maze.vue'
Vue.component('Maze', Maze)

import World from './components/World.vue'
Vue.component('World', World)

import Controls from './components/Controls.vue'
Vue.component('Controls', Controls)

export default {
  name: 'App',
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
