<template>
  <div id="controls">
    <div class="row">
      <div />
      <div
        class="button up"
        @touchstart.prevent="$emit('up')"
      />
      <div />
    </div>
    <div class="row">
      <div
        class="button left"
        @touchstart.prevent="$emit('left')"
      />
      <div />
      <div
        class="button right"
        @touchstart.prevent="$emit('right')"
      />
    </div>
    <div class="row">
      <div />
      <div
        class="button down"
        @touchstart.prevent="$emit('down')"
      />
      <div />
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'Controls',
})
</script>

<style lang="scss">
#controls {
  height: 150px;
  padding: 10px 50px;
  width: 100%;
  box-sizing: border-box;

  @media (min-width:1025px) { /* big landscape tablets, laptops, and desktops */
    display: none;
  }


  .row {
    height: 33%;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;

    & > div {
      flex: 1;
    }

    .button {
      background: grey;
    }
  }
}
</style>
