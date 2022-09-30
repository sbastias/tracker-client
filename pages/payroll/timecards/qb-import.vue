<template>
  <section id="qbwv-import">

    <div v-if="tally">
      Records to create: {{ tally.toCreate.length }} ... Records to update: {{ tally.toUpdate.length }} ... Records to delete: {{ tally.toDelete.length }} ...
      <button @click="queueQBQueries">Import to QB</button>
    </div>

    

    <TimecardConsole  />
  

  </section>
</template>

<script>
import TimecardConsole from '~/components/timecards/TimecardConsole'

export default {
  props: [ 'tally'],
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
  methods: {
    resizeMain () {},
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