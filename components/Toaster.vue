<template>
  <div id="toaster" v-if="activated">
    <transition name="toaster" appear>
      <div id="toaster-body" v-if="visible" :class="options.status">
        <span v-if="options.status == 'success'"><b>Success!</b></span>
        <span v-if="options.status == 'error'"><b>Error!</b></span>
        {{options.message}}
        <div id="toaster-error-x-container" v-if="options.status == 'error'">
          <CancelX @cancel="deactivateToaster" :on-red="true" />
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import CancelX from '~/components/ui/CancelX'
export default {
  components: {
    CancelX
  },
  data () {
    return {
      hideDelay: 3000,
      activated: false,
      visible: false,
      options: false
    }
  },
  created () {
    this.$bus.$on('toaster', this.activateToaster)
  },
  beforeDestroy () {
    this.$bus.$off('toaster')
  },
  methods: {
    activateToaster (options) {

      this.options = options
      this.activated = true
    },
    deactivateToaster () {
      this.visible = false
      setTimeout(() => {
        this.activated = false
        this.options = false
      }, 500)
    }
  },
  watch: {
    activated: {
      immediate: true,
      handler (val) {
        if (val) {
          this.visible = true

          if (this.options.status == 'error') return// do not automatically close an error

          setTimeout(() => {
            this.deactivateToaster()
          }, this.hideDelay)
        }
      }
    }
  }
}
</script>

<style lang="scss">
#toaster {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  height: 0;
  overflow: visible;
  z-index: 200000;

  #toaster-body {
    width: 80%;
    max-width: 700px;
    background-color: rgba(0,0,0,0.5);
    border: 1px solid #000;
    color: white;
    margin-top: 90px;    
    border-radius: 6px;
    padding: 10px 30px;
    box-shadow: 2px 2px 10px -3px #000;
    text-align: center;
    position: relative;

    &.success {
      background-color: rgba(73, 199, 66, 0.8);
      backdrop-filter: blur(2px);
      border: 1px solid #04ff61;
    }
    &.error {
      background-color: rgba(200,0,0, 0.7);
      border: 1px solid red;
    }
  }
}

#toaster-error-x-container {
  height: 15px;
  width: 15px;
  position: absolute;
  right: 10px;
  top: 12px;
}

.toaster-enter-active {
  transition: .3s;
}
.toaster-leave-active {
  transition: .5s;
}
.toaster-enter,
.toaster-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
.toaster-enter-to,
.toaster-leave {
  opacity: 1;
  transform: translateY(0);
}
</style>