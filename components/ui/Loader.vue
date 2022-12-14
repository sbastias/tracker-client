<template>
  <span class="loader">
    <!--span class="loader-arcs">
      <span class="loader-arc"></span>
      <span class="loader-arc"></span>
      <span class="loader-arc"></span>
      <span class="loader-arc"></span>
    </span-->
    <span class="loader-circ"></span>
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

  .loader-circ {
    height: 20px;
    width: 20px;
    position: relative;
    display: inline-block;
    margin-right: 10px;
    border: 2px solid #61cae6;
    border-right-color: transparent;
    border-radius: 50%;
    animation-timing-function: linear;
    animation-name: spin;
    animation-iteration-count: infinite;
    animation-duration: .7s;
  }


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
      border: 2px solid #61cae6;
      border-right-color: transparent;
      border-bottom-color: transparent;
      border-left-color: transparent;
      border-radius: 50%;
      position: absolute;
      top: 0;
      left: 0;
      animation-timing-function: linear;
      animation-name: spin;
      animation-iteration-count: infinite;
      opacity: .5;

      &:first-child {
        animation-duration: 1s;
        animation-timing-function: linear;
      }
      &:nth-child(2) {
        animation-duration: 1.25s;
        animation-delay: .1s;
        animation-timing-function: ease-in-out;
      }
      &:nth-child(3) {
        animation-duration: 1.5s;
        animation-delay: .2s;
        animation-timing-function: ease-in-out;
      }
      &:nth-child(4) {
        animation-duration: 1.75s;
        animation-delay: .3s;
        animation-timing-function: ease-in-out;
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