<template>
  <div
    ref="player"
    class="player"
  >
    <div class="player-avatar">
      🚶🏻
    </div>
    <div class="player-name">
      {{ user.name }}
    </div>
  </div>
</template>

<script>
import config from '../config'

export default {
  name: 'Player',
  props: [
    'user',
    'x',
    'y',
  ],
  watch: {
    user () {
      this.update()
    },
    x () {
      this.update()
    },
    y () {
      this.update()
    },
  },
  mounted () {
    this.update()
  },
  methods: {
    update () {
      this.$refs.player.style.transform = `translate(${this.user.x * config.tileSize}px, ${this.user.y * config.tileSize}px)`;
    },
  },
}
</script>

<style lang="scss">
.player {
  position: absolute;
  /*
  width: 25px;
  height: 25px;
  border-radius: 100%;
  background: red;
  */
  transition: transform 0.2s ease;
}

.player-name {
  position: absolute;
  top: -30px;
  left: 20px;
  background-color: #00000099;
  color: white;
  padding: 5px;
  font-size: 14px;
  border-radius: 3px;
}

.player-avatar {
  font-size: 25px;
  line-height: 25px;
  text-shadow: 0px 5px 11px black;
}
</style>
