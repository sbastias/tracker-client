<template>
  <span class="loader">
    <span class="loader-arcs">
      <span class="loader-arc"></span>
      <span class="loader-arc"></span>
      <span class="loader-arc"></span>
      <span class="loader-arc"></span>
    </span>
    <span class="loader-message" v-if="message">
      {{message}}
    </span>
  </span>
</template>

<script>
export default {
  props: ['message']
}
</script>

<style lang="scss">
.loader {
  display: flex;
  align-items: center;

  .loader-arcs {
    height: 20px;
    width: 20px;
    position: relative;
    display: inline-block;
    margin-right: 10px;

    .loader-arc {
      height: inherit;
      width: inherit;
      display: inline-block;
      border: 2px solid #990000;
      border-right-color: transparent;
      border-bottom-color: transparent;
      border-left-color: transparent;
      border-radius: 50%;
      position: absolute;
      top: 0;
      left: 0;

      &:first-child {
        animation: spin ease-in-out 1s infinite;
      }
      &:nth-child(2) {
        animation: spin ease-in-out 2s infinite;
      }
      &:nth-child(3) {
        animation: spin ease-in-out 3s infinite;
      }
      &:last-child {
        animation: spin ease-in-out 4s infinite;
      }
    }
  }

  .loader-message {

  }
}

@keyframes spin {
  from {
    transform: rotate(0);
  } to {
    transform: rotate(360deg);
  }
}
</style>