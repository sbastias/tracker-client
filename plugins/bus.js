import Vue from 'vue'
import {mapGetters} from 'vuex'
import candidateStatuses from '../config/workforce/candidate-statuses'
import updateStatuses from '../config/workforce/update-statuses'

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
        candidateStatuses,
        updateStatuses
      }
    },
    computed: {
      ...mapGetters(['storedSupplier']),
      servers () {
        return {
          development: {
            payroll: 'http://localhost:3332',
            tracker: 'http://localhost:8011'
          },
          localtest: {
            payroll: 'http://localhost:3333',
            tracker: 'http://localhost:8011'
          },
          remotetest: {
            payroll: `https://payroll.starla.bullittstaffing.com/test/`,
            tracker: 'https://starla-server.thebullittgroup.com'
          },
          production: {
            payroll: `https://payroll.starla.bullittstaffing.com/`,
            tracker: 'https://starla-server.thebullittgroup.com'
          }
        }
      }
    },
    methods: {
      activateToolTips () {
        let toolTipEls = document.querySelectorAll('[tool-tip]')
        //console.log(toolTipEls, '<< toolTips')
        Array.from(toolTipEls).forEach(el => {
          el.addEventListener('mouseover', this.$bus.showToolTip)
          el.addEventListener('mousemove', this.$bus.showToolTip)
          el.addEventListener('mouseout', this.$bus.hideToolTip)
          el.addEventListener('click', this.$bus.hideToolTip)
        })
      },
      deactivateToolTips() {
        let toolTipEls = document.querySelectorAll('[tool-tip]')
        //console.log(toolTips)
        Array.from(toolTipEls).forEach(el => {
          //console.log(el)
          el.removeEventListener('mouseover', this.$bus.showToolTip)
          el.removeEventListener('mousemove', this.$bus.showToolTip)
          el.removeEventListener('mouseout', this.$bus.hideToolTip)
          el.removeEventListener('click', this.$bus.hideToolTip)
        })
      },
      showToolTip ($ev) {
        $ev.stopPropagation()
        this.$emit('tool-tip',  $ev)
      },
      hideToolTip ($ev) {
        $ev.stopPropagation()
        this.$emit('tool-tip',  null)
      },
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