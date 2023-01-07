<template>
  <section id="qbwv-import">

    <div id="tally-summary">
      
      <template v-if="startingTally">
        <div>Records to create: {{ startingTally.toCreate.length }} ... Records to update: {{ startingTally.toUpdate.length }} ... Records to delete: {{ startingTally.toDelete.length }} ...</div>
      </template>
      

      <button @click="getCurrentCompanyFileData">Refresh Company File Data</button>
      <button @click="compareSFtoQB">Compare Current Salesforce/Quickbooks Data</button>
      <button @click="generateModificationRequests" :disabled="totalMods == 0">Queue Modification Requests for WebConnector</button>
      <button @click="queueQBTimeTrackingQueries">Prepare Time Trackings for Quickbooks</button>
      <button @click="approveQBTimeTrackingQueries" :disabled="!activityId">Approve for WebConnector</button>
      <template v-if="local">
        
          <button @click="revertTimecards">Revert Timecards (SF QB Data Clear)</button>
          <button @click="reconcileTimecards">Reconcile Timecards (QB ->  SF)</button>
          <button @click="doNotSyncAll">Do Not Sync ALL Payroll Folders</button>

      </template>
    
    </div>

    
    <div id="timecard-console-container">

      <TimecardConsole 
      v-show="weekending" 
      @update-activity-id="updateActivityId"
      :billrate-mods="billrateMods"
      :payrate-mods="payrateMods"
      />
      
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
      local: false,
      activityId: false,
      payrateMods: [],
      billrateMods: []
    }
  },
  computed: {
    totalMods () {
      return this.billrateMods.length + this.payrateMods.length
    },
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

    this.local = process.client && location.href.indexOf('localhost:3000') > -1
    
  
  },
  methods: {
    async getCurrentCompanyFileData () {
      await this.$axios.post(`/payroll/quickbooks/retrieve/data`, {supplier: this.supplier})
      .then(({data}) => {
        console.log(data)
      })
      .catch(e => {
        console.log(e)
        alert('Error!')
      })
    },
    updateActivityId (id) {
      console.log(id, '<< updated activity ID')
      this.activityId = id
    },


    async compareSFtoQB () {
      await this.$axios.post(`/payroll/salesforce/quickbooks/compare`, {supplier: this.supplier, weekending: this.weekending})
      .then(({data}) => {
        console.log(data)
      })
      .catch(e => {
        console.log(e)
        alert('Error!')
      })
    },
    updateActivityId (id) {
      console.log(id, '<< updated activity ID')
      this.activityId = id
    },
    async generateModificationRequests () {
      
      await this.$axios.post(`/payroll/quickbooks/modifications/execute`, {
        supplier: this.supplier, 
        payrateMods: this.payrateMods, 
        billrateMods: this.billrateMods
      })
      .then(({data}) => {
        console.log(data)
      })
      .catch(e => {
        console.log(e)
        alert('Error!')
      })
    },
    resizeMain () {
    
      setTimeout(() => {
        let topBoundary = document.getElementById('tally-summary').getBoundingClientRect().bottom// + document.getElementById('tally-summary').getBoundingClientRect().height

        console.log(topBoundary, '<< qb-import topBoundary')

        let consoleContainer = document.getElementById('timecard-console-container')
        let consoleHeight = window.innerHeight - (topBoundary + 30)

        consoleContainer.style.height = `${ consoleHeight }px`
      }, 100)
      
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
    async queueQBTimeTrackingQueries () {
      await this.$axios.post(`/payroll/quickbooks/timetrackings/queue`, {weekendingOrDay: this.weekending, period: this.$parent.period, supplier: this.supplier})
      .then(async ({data}) => console.log(data))
      .catch(e => {
        console.log(e)
        alert('Error!')
      })
    },
    async approveQBTimeTrackingQueries () {
      return await this.$axios.post(`/payroll/quickbooks/timetrackings/approve`, {activityId: this.activityId})
      .then(({data}) => {
        console.log(data)
      })
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
    button {
      margin: 5px 0;
    }
  }
</style>