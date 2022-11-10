<template>
  <div id="console-timecard">
    <div id="console-timecard__header">
      <h3>Payroll Console for {{$parent.supplier}}</h3>
      <div>
        <span v-show="payrateMods.length > 0">Pay Rate Mods: {{payrateMods.length}}&nbsp;</span>
        <span v-show="billrateMods.length > 0">Bill Rate Mods: {{billrateMods.length}}&nbsp;</span>
        <button @click="clearConsole">Clear Console</button>
      </div>
    </div>
    <ul id="console-timecard__scrolling" ref="scrolling-area">
      <li v-for="(line, idx) in statusStack" :key="idx+'line'" class="output-item">
        <div class="timestamp">{{moment(line.timestamp).format('YYYY-MM-DD hh:mm:ssA')}}</div>
        <div>
          <div v-if="line.content.requests">
            <ul class="requests">
              <li v-for="(req, idx) in line.content.requests" :key="`req-${idx}`">
                <b>{{req.type}}</b> {{req.name}}
              </li>
            </ul>
          </div>
          <div v-if="line.content.errors">
            <ul class="errors">
              <li v-for="(err, idx) in line.content.errors" :key="`err-${idx}`">
                {{err}}
              </li>
            </ul>
          </div>
          <div v-if="line.content.inconsistencies">
            <ul class="inconsistent">
              <li v-for="(inconsist, idx) in line.content.inconsistencies.payRates" :key="`inconsist-${idx}`">
                <div v-html="inconsist.message"></div>
                <div v-if="inconsist.type == 'MISMATCHED_PAYRATE'">
                  <label :for="`mod-payrate-${idx}`"><input :value="{id: inconsist.id, rate: inconsist.rate, paytype: inconsist.paytype}" :id="`mod-payrate-${idx}`" type="checkbox" v-model="$parent.payrateMods" /> Activate QB Pay Rate Modification</label>
                </div>
              </li>
            </ul>
            <ul class="inconsistent">
              <li v-for="(inconsist, idx) in line.content.inconsistencies.billRates" :key="`inconsist-${idx}`">
                <div v-html="inconsist.message"></div>
                <div v-if="inconsist.type == 'MISMATCHED_BILLRATE'">
                  <label :for="`mod-billrate-${idx}`"><input :value="{id: inconsist.id, rate: inconsist.rate, paytype: inconsist.paytype}" :id="`mod-billrate-${idx}`" type="checkbox" v-model="$parent.billrateMods" /> Activate QB Bill Rate Modification</label>
                </div>
              </li>
            </ul>
          </div>
          <div :class="line.content.status" v-html="line.content.message"></div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import moment from 'moment'
export default {
  props: ['starting-tally','payrate-mods','billrate-mods'],
  data () {
    return {
      moment,
      reconnectInterval: false,
      statusStack: []
    }
  },
  mounted () {

    this.initiateComms()
    
    
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
    queueMod ($ev) {
      $ev.preventDefault()
      console.log($ev.target.dataset.id)
    },
    initiateComms () {

      this.$axios.defaults.baseURL = this.$bus.servers[process.env.NODE_ENV].payroll

      try {
        this.createSocket(this.$parent.supplier)
      } catch (e) {throw e}

      setTimeout(() => this.$axios.post('/console/io')
      .then(({data}) => console.log(data, this.$parent.supplier)), 1000)
    },
    resizeMain () {

      this.$nextTick(() => {
        let containerHeight = document.getElementById('console-timecard').getBoundingClientRect().height
        let headerHeight = document.getElementById('console-timecard__header').getBoundingClientRect().height

        let scrollingArea = this.$refs['scrolling-area']

        scrollingArea.style.height = `${containerHeight - headerHeight - 20}px`
      })
      
    },
    async clearConsole () {
      
      await this.$axios.post('/clear', {supplier: this.$parent.supplier})
      .then(() => {
        this.statusStack = []
        this.$parent.payrateMods = []
        this.$parent.billrateMods = []
      })
    },
    tryToReconnect () {
      this.reconnectInterval = setInterval(() => {
        try {
          this.initiateComms()
          clearInterval(this.reconnectInterval)
        } catch (e) {
          console.log(e)
        }
      }, 1000)
    },
    createSocket (supplier) {
      
      this.socket = this.$nuxtSocket({
        name: 'payroll-' + supplier,
        transports: ['websocket'],
        path: '/ws/'
      })
      this.socket.on('statusUpdate', update => {
        this.$bus.log('Received UPDATE emission!', update)
        this.statusStack.push(update)
        if (update.content.activityId) this.$emit('update-activity-id', update.content.activityId)
        if (update.content.status == 'success' && update.content.type) {
          switch (update.content.type) {
            case 'PAYRATE_MOD':
              let successfulPayRateMod = this.$parent.payrateMods.find(el => el.id == update.content.id)
              this.$parent.payrateMods.splice(this.$parent.payrateMods.indexOf(successfulPayRateMod), 1)
              
            case 'BILLRATE_MOD':
              let successfulBillRateMod = this.$parent.billrateMods.find(el => el.id == update.content.id)
              this.$parent.billrateMods.splice(this.$parent.billrateMods.indexOf(successfulBillRateMod), 1)
              break
          }
        }
      })
      //this.socket.on('reconnection', () => alert('Reconnected!'))
      this.socket.on('disconnect', reason => {
        this.$bus.log('Disconnected?', reason)

        this.tryToReconnect()
        
      })
    },
  },
  watch: {
    '$parent.supplier' (val) {

      console.log('SUPPLIER CHANGE IN CONSOLE:', val)
      this.statusStack.push({timestamp: Date.now(), content: {status: 'info', message: 'Changing Supplier... please hold...'}})

      this.socket.disconnect()//triggers initiateComms
      //this.createSocket(val)

    },
    statusStack (val) {

      if (val.length == 0) return false

      this.$nextTick(() => {
        //console.log('should be scrolling...', this.$refs['scrolling-area'].lastElementChild)
        this.$refs['scrolling-area'].lastChild.scrollIntoView(false)
      })
    },
    
  }

}
</script>

<style lang="scss">

#console-timecard {

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

    .output-item{

      display: grid;
      grid-gap: 5px;
      grid-template-columns: max-content auto;

      &:last-child {
        padding-bottom: 10px;
      }

      div {
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

      ul > li {
        margin: 5px 0;
      }
    }
  }
  
  height: 100%;
}
</style>
