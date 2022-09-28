<template>
<div>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
    
      <polygon class="bg" :class="{custom}" points="0 0 0 30 17.74 30 30 17.27 30 0 0 0" />
    
    
      <path
        d="M0,0V30H17.74L30,17.27V0ZM17.69,26.52V17.26h8.94ZM28,15.27H24.85v-1.6H5.29v2.66H15.74v4.23H5.29v2.66H15.74V28H2V2H28Z"
      />
      <rect x="5.29" y="6.79" width="19.56" height="2.66" />
    
  </svg>
</div>
</template>

<script>
export default {
  props: ['custom'],
  methods: {
  }
}
</script>

<style lang="scss">
.bg {
  fill: white;
  &.default {
    fill: rgb(253, 253, 166);
  }
  &.custom {
    fill: rgb(250, 191, 136);
  }
}
</style>
