<template>
  <section id="qbwv-import">

    <div id="tally-summary">
      <div v-if="startingTally">Records to create: {{ startingTally.toCreate.length }} ... Records to update: {{ startingTally.toUpdate.length }} ... Records to delete: {{ startingTally.toDelete.length }} ...</div>
      <button @click="queueQBQueries">Import to QB</button>
    </div>

    
    <div id="timecard-console-container">
      <TimecardConsole />
    </div>
  

  </section>
</template>

<script>
import TimecardConsole from '~/components/timecards/TimecardConsole'

export default {
  props: [ 'starting-tally','supplier'],
  components: {
    TimecardConsole
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
    async queueQBQueries () {
      await this.$axios.post(`/payroll/quickbooks/update`, {weekendingOrDay: this.$parent.formattedWeekendingOrDay, period: this.$parent.period, supplier: this.$parent.supplier})
      .then(async ({data}) => console.log(data))
      .catch(e => {
        console.log(e)
        alert('Error!')
      })
    },
  }
}
</script>