import Vue from 'vue'

export default ({store}) => {
  Vue.prototype.$bus = new Vue({
    name: 'Bus',
    template: '<div>BUS IS HERE!</div',
    data () {
      return {
        metadata: false
      }
    }
  })
}