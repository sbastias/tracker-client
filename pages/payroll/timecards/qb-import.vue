<template>
  <section id="qbwv-import">

    <div id="tally-summary">
      <div v-if="startingTally">Records to create: {{ startingTally.toCreate.length }} ... Records to update: {{ startingTally.toUpdate.length }} ... Records to delete: {{ startingTally.toDelete.length }} ...</div>
      <button @click="queueQBQueries">Import to QB</button>
      <template v-if="local">
        
          <button @click="revertTimecards">Revert Timecards</button>
          <button @click="reconcileTimecards">Reconcile Timecards</button>
          <button @click="doNotSyncAll">Do Not Sync ALL Payroll Folders</button>

      </template>
    
    </div>

    
    <div id="timecard-console-container">

      <TimecardConsole v-show="weekending" />
      
    </div>
  

  </section>
</template>

<script>
import TimecardConsole from '~/components/timecards/TimecardConsole'

export default {
  props: [ 'starting-tally','supplier','weekending-raw'],
  components: {
    TimecardConsole
  },  
  data () {
    return {
      local: process.client && location.href.indexOf('localhost:3000') > -1
    }
  },
  computed: {
    weekending () {
      return this.weekendingRaw && this.weekendingRaw.toISOString().substring(0,10)
    }
  },
  created () {
    if (process.client) {
      this.$bus.$on('resize', this.resizeMain)
    }
    
    //console.log(this.$route.params)
  },
  beforeDestroy() {
    if (process.client) {
      this.$bus.$off('resize')
    }
  },
  mounted () {

    this.resizeMain()
    
  
  },
  methods: {
    resizeMain () {
    
      let topBoundary = document.getElementById('tally-summary').getBoundingClientRect().top + document.getElementById('tally-summary').getBoundingClientRect().height

      let consoleContainer = document.getElementById('timecard-console-container')
      let consoleHeight = window.innerHeight - topBoundary - 30

      consoleContainer.style.height = `${ consoleHeight }px`
      
    },
    async doNotSyncAll () {
      await this.$axios.post(`/batch/do-not-sync`)
      .then(({data}) => console.log(data))
      .catch(e => {
        console.log(e)
        alert('Error!')
      })
    },
    async revertTimecards () {
      if (confirm(`Are you sure you want to clear all QB data for ${this.supplier} for the weekending of ${this.$parent.weekendingYYYYMMDD}?`)) {
        await this.$axios.post('/revert/time-trackings',{weekending: this.weekending, supplier: this.supplier})
        .then(({data}) => console.log(data))
        .catch(e => {
          alert('Not reverted! Error!')
          console.log(e)
        })
      }
    },
    async reconcileTimecards () {
      await this.$axios.post('/reconcile/time-trackings', {weekending: this.weekending, supplier: this.supplier})
      .then(({data}) => console.log(data))
      .catch(e => alert('not reverted!'))
    },
    async queueQBQueries () {
      await this.$axios.post(`/payroll/quickbooks/update`, {weekendingOrDay: this.weekending, period: this.$parent.period, supplier: this.supplier})
      .then(async ({data}) => console.log(data))
      .catch(e => {
        console.log(e)
        alert('Error!')
      })
    },
  }
}
</script>

<style lang="scss">
  #tally-summary {
    padding-bottom: 20px;
  }
</style>