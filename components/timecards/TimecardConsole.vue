<template>
  <div id="console-timecard">
    <div>Payroll Console</div>
    <ul>
      <li v-for="(line, idx) in statusStack" :key="idx+'line'">
        {{line}}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: ['tally'],
  data () {
    return {
      reconnectInterval: false,
      statusStack: []
    }
  },
  mounted () {
    this.createSocket()

    /*
    this.postInterval = setInterval(() => {
      this.$axios.post('/test/io')
      .then(({data}) => console.log(data))
    },2000)
    */

  },
  beforeDestroy () {
    this.socket = false
    this.statusStack = []
    //clearInterval(this.postInterval)
  },
  methods: {
    tryToReconnect () {
      this.reconnectInterval = setInterval(() => {
        try {
          this.createSocket()
          clearInterval(this.reconnectInterval)
        } catch (e) {
          console.log(e)
        }
      }, 1000)
    },
    createSocket () {
      
      this.socket = this.$nuxtSocket({
        name: 'timecards',
        transports: ['websocket'],
        path: '/ws/'
      })
      this.socket.on('statusUpdate', update => {
        this.$bus.log('Received UPDATE emission!', update)
        this.statusStack.push(update)
      })
      this.socket.on('reconnection', () => alert('Reconnected!'))
      this.socket.on('disconnect', reason => {
        this.$bus.log('Disconnected?', reason)

        this.tryToReconnect()
        
      })
    },
  }
}
</script>

<style lang="scss">

#console-timecard{
background: #666;
padding: 10px;
color: white;

  > ul {
    list-style: none;
    display: block;
    padding: 15px;
    margin: 0;
    background: #333;
    color: #aaa;
    
  }
  
  height: 100%;
}
</style>
