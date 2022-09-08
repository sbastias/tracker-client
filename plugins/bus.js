import Vue from 'vue'

export default ({store}) => {
  Vue.prototype.$bus = new Vue({
    name: 'Bus',
    template: '<div>BUS IS HERE!</div',
    created () {
      if (process.client) {
        window.addEventListener('resize',() => this.$emit('resize'))
      }
    },
    data () {
      return {
        metadata: false,
        accounts: false,
        users: false
      }
    },
    methods: {
      log () {
        //return false
        console.log(JSON.parse(JSON.stringify(arguments)))
      }
    }
  })
}