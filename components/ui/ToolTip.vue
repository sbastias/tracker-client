<template>
  <div id="tool-tip" :class="[type, {show}]" ref="tool-tip">
    <span>{{ content || 'Placeholder' }}</span>
  </div>
</template>

<script>
export default {
  data () {
    return {
      content: '',
      type: null,
      show: false
    }
  },
  computed: {
    headerOffset () { return screen.height - screen.availHeight }
  },
  created () {
    this.$bus.$on('tool-tip', this.positionAndDisplay)
  },
  beforeDestroy () {
    this.$bus.$off('tool-tip', this.positionAndDisplay)
  },
  mounted () {
    //this.positionAndDisplay()
  },
  methods: {
    
    positionAndDisplay ($ev) {
      
      if (!$ev) return this.show = false

      let { target, clientX, clientY } = $ev

      //console.log(target)

      this.content = target.getAttribute('tool-tip')

      if (!this.content) return this.show = false

      let thisWidth = this.$refs['tool-tip'].getBoundingClientRect().width

      let offsetX = clientX - thisWidth / 2 // centered content

      if ( clientX + thisWidth/2 > window.innerWidth ) offsetX -= (clientX + thisWidth/2) - window.innerWidth

      if ( clientX - thisWidth/2 < 0 ) offsetX -= (clientX - thisWidth/2)

      this.$refs['tool-tip'].style.transform = `translate(${ offsetX }px, ${clientY + 15 }px)`

      this.$nextTick(() => this.show = true)
    }
  }
}
</script>

<style lang="scss">
#tool-tip {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 100000000;
  border: 1px solid #f99d1c;
  background: lighten(#f99d1c, 40%);
  color: rgba(0,0,0,0.7);
  padding: 5px;
  font-size: .9rem;
  border-radius: 3px;
  opacity: 0;
  pointer-events: none;
  transition: opacity .2s ease-out;

  &.show {
    opacity: 1;
  }
}
</style>