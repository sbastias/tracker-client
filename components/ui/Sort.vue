<template>
<div class="sort-icon">
  <svg  
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 76.39 132.44"
  >
    <polygon class="sort-asc" :class="{active: direction == 'asc'}" points="76.39 52.44 0 52.44 38.2 0 76.39 52.44" />
    <polyline id="sort-desc" :class="{active: direction == 'desc'}" points="0 80 38.2 132.44 76.39 80" />
  </svg>
</div>
</template>

<script>
export default {
  props: ['direction']
}
</script>
<style lang="scss">
.sort-icon {
  pointer-events: none;
  //width: 6px;
  width: 6px;
  height: 100%;
  position: absolute;
  right: 5px;
  top: 0;
  display: flex;
  align-items: center;

  polygon,
  polyline {
    fill: #888;
    &.active {
      fill: #ff00d0;
    }
  }
}
</style>
