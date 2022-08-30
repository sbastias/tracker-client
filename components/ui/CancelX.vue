<template>
  <div @click="cancel">
  <svg
    id="cancel-x-svg"
    :class="{'on-red': onRed}"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 203.61 203.61"
  >
    
      <path
        d="M196.38,161.49l-59.69-59.69,59.69-59.69c9.64-9.64,9.64-25.26,0-34.89h0c-9.64-9.64-25.26-9.64-34.89,0l-59.69,59.69L42.12,7.23c-9.64-9.64-25.26-9.64-34.89,0h0c-9.64,9.64-9.64,25.26,0,34.89l59.69,59.69L7.23,161.49c-9.64,9.64-9.64,25.26,0,34.89h0c9.64,9.64,25.26,9.64,34.89,0l59.69-59.69,59.69,59.69c9.64,9.64,25.26,9.64,34.89,0h0c9.64-9.64,9.64-25.26,0-34.89Z"
      />
    
  </svg>
  </div>
</template>

<script>
export default {
  props: ['on-red'],
  methods: {
    cancel () {
      this.$emit('cancel')
    }
  }
}
</script>

<style lang="scss">
#cancel-x-svg {
  position: relative;
  height: 100%;
  width: 100%;
  cursor: pointer;

  path {
    fill: #888888;
  }

  &:hover path {
    fill: #cc0000;  
  }

  &.on-red {
    path {
      fill: rgba(255,255,255,0.5);
    }

    &:hover path {
      fill: rgb(255,255,255);
    }
  }
}
</style>
