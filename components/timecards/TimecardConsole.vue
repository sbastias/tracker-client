<template>
  <div id="console-timecard">
    <div id="console-timecard__header">
      <h3>Payroll Console</h3>
      <button @click="clearConsole">Clear Console</button>
    </div>
    <ul id="console-timecard__scrolling" ref="scrolling-area">
      <li v-for="(line, idx) in statusStack" :key="idx+'line'">
        <div class="timestamp">{{moment(line.timestamp).format('YYYY-MM-DD hh:mm:ssA')}}</div>
        <div :class="line.content.status">{{line.content.message}}</div>
      </li>
    </ul>
  </div>
</template>

<script>
import moment from 'moment'
export default {
  props: ['starting-tally'],
  data () {
    return {
      moment,
      reconnectInterval: false,
      statusStack: []
    }
  },
  mounted () {
    this.createSocket()

    this.$axios.post('/test/io')
    .then(({data}) => console.log(data))
    
    /*
    this.postInterval = setInterval(() => {
      this.$axios.post('/test/io')
      .then(({data}) => console.log(data))
    },2000)
    */
    
    
   this.resizeMain()

  },
  beforeDestroy () {
    this.socket = false
    this.statusStack = []
    //clearInterval(this.postInterval)
  },
  methods: {
    resizeMain () {

      this.$nextTick(() => {
        let containerHeight = document.getElementById('console-timecard').getBoundingClientRect().height
        let headerHeight = document.getElementById('console-timecard__header').getBoundingClientRect().height

        let scrollingArea = this.$refs['scrolling-area']

        scrollingArea.style.height = `${containerHeight - headerHeight - 20}px`
      })
      
    },
    clearConsole () {
      this.statusStack = []
    },
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
        name: 'payroll',
        transports: ['websocket'],
        path: '/ws/'
      })
      this.socket.on('statusUpdate', update => {
        this.$bus.log('Received UPDATE emission!', update)
        this.statusStack.push(update)
      })
      //this.socket.on('reconnection', () => alert('Reconnected!'))
      this.socket.on('disconnect', reason => {
        this.$bus.log('Disconnected?', reason)

        this.tryToReconnect()
        
      })
    },
  },
  watch: {
    statusStack (val) {

      if (val.length == 0) return false

      this.$nextTick(() => {
        //console.log('should be scrolling...', this.$refs['scrolling-area'].lastElementChild)
        this.$refs['scrolling-area'].lastChild.scrollIntoView(false)
      })
    }
  }
}
</script>

<style lang="scss">

#console-timecard{
background: #666;
padding: 10px;
color: white;

#console-timecard__header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
}

  > ul {
    list-style: none;
    display: block;
    padding: 15px 15px 0;
    margin: 0;
    background: #333;
    color: #aaa;
    overflow: scroll;

    > li{
      display: grid;
      grid-gap: 5px;
      grid-template-columns: max-content auto;

      &:last-child {
        padding-bottom: 10px;
      }

      > div {
        &.timestamp {
          font-family: 'Courier New', Courier, monospace;
          font-size: .8em;
          width: max-content;
        }
        &.success {
          color: rgb(33, 168, 33);
        }
        &.error {
          color: rgb(168, 33, 33);
        }
      }
    }
  }
  
  height: 100%;
}
</style>
