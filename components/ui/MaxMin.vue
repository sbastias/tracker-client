<template>
<div class="max-min" :style="{width, height: width}" @click="$emit('click')">
  <svg
    id="Layer_2"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 71.13 71.13"
  >
      <path
        class="cls-1"
        d="M35.57,0C15.92,0,0,15.92,0,35.57s15.92,35.56,35.57,35.56,35.56-15.92,35.56-35.56S55.21,0,35.57,0Zm0,63.43c-15.39,0-27.87-12.48-27.87-27.87S20.17,7.7,35.57,7.7s27.87,12.48,27.87,27.87-12.48,27.87-27.87,27.87Z"
      />
      <rect class="cls-1" x="16.53" y="31.07" width="38.12" height="8.99" />
      <rect class="cls-1" x="31.1" y="16.51" width="8.99" height="38.12" v-if="!maximized" />
  </svg>
</div>
</template>

<script>
export default {
  props: ['maximized', 'width-px'],
  computed: {
    width () {
      return `${ this.widthPx }px`
    }
  }
}
</script>

<style lang="scss">
.max-min {
  display: inline-block;
  margin-left: 5px;
  cursor: pointer;
}
</style>
