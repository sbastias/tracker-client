import Vue from 'vue'
import {mapGetters} from 'vuex'

export default ({store}) => {
  Vue.prototype.$bus = new Vue({
    name: 'Bus',
    template: '<div>BUS IS HERE!</div',
    created () {
      if (process.client) {
        window.addEventListener('resize',() => this.$emit('resize'))
      }
    },
    beforeDestroy () {
      if (process.client) {
        window.removeEventListener('resize')
      }
    },
    data () {
      return {
        metadata: false,
        accounts: false,
        users: false,
        fullscreen: false,
      }
    },
    computed: {
      ...mapGetters(['storedSupplier']),
      servers () {
        return {
          development: {
            payroll: 'http://localhost:8009',
            tracker: 'http://localhost:8011'
          },
          testing: {
            payroll: `https://qbwc.thebullittgroup.com/test/${store.getters.storedSupplier == 'QAJAQ' && 'qajaq' || 'ysg'}/`,
            tracker: 'https://starla-server.thebullittgroup.com'
          },
          production: {
            payroll: `https://qbwc.thebullittgroup.com/${store.getters.storedSupplier == 'QAJAQ' && 'qajaq' || 'ysg'}/`,
            tracker: 'https://starla-server.thebullittgroup.com'
          }
        }
      }
    },
    methods: {
      toggleFullscreen () {
        this.fullscreen = !this.fullscreen
      },
      log () {
        //return false
        console.log(JSON.parse(JSON.stringify(arguments)))
      }
    }
  })
}