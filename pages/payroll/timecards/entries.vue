<template>
  <section id="timecard-entry-ui">

    

    <div id="bottom-container" ref="bottom-container">
      <div id="main-container">
        <div id="status-bar" ref="status-bar">
          <TimecardFilters :filters="filters" />
          <div>
            <input type="text" v-model="searchTerm" placeholder="Name Search" />
          </div>
          <div>
            
          <a @click="autoFill">Auto-fill</a> {{weekending}}
          
          </div>
        </div>

        <section class="time-tracker-scrolling-container" ref="timecard-container">
          <ul id="time-tracking-list">
            <Timecard
              v-for="(row, idx) in dataRows"

              v-show="activeFilters.payType.indexOf(row.AVTRRT__Contact_Candidate__r && row.AVTRRT__Contact_Candidate__r.Pay_Type__c) > -1
              && activeFilters.client.indexOf(row.AVTRRT__Employer__r.Name) > -1
              && activeFilters.shift.indexOf(row.Shift__c) > -1
              && (searchTerm.length > 2 && row.AVTRRT__Contact_Candidate__r && row.AVTRRT__Contact_Candidate__r.Name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1 || searchTerm.length < 3)"

              :key="`placement-${idx}`"
              :row="row"
              @row-change="startSaveTimer"
              :class="[
                {
                  unsaved: row.unsaved,
                  saved: row.saved,
                  saving: row.saving,
                  shownonbillable: row.shownonbillable
                },
                row.AVTRRT__Contact_Candidate__r.Pay_Type__c || 'undefined'
              ]"
            />
          </ul>
        </section>
      </div>
    </div>
    
  </section>
</template>

<script>
import Timecard from '~/components/timecards/Timecard'
import TimecardFilters from '~/components/timecards/TimecardFilters'
import moment from 'moment'

export default {
  props: ['data-rows','weekending','starting-tally'],
  components: {Timecard, TimecardFilters},
  data () {
    return {
      searchTerm: '',
      filters: {
        payType: [],
        client: [],
        shift: []
      },
      moment,
      activeNoteId: false,
      saveTimers: {},
      unsaved: {},
      tally: {}
    }
  },
  computed: {
    activeFilters() {
      return Object.keys(this.filters).reduce((acc, _type) => {
        if (!acc[_type]) acc[_type] = []
        acc[_type] = this.filters[_type].filter(el => el.active).map(el => el.label)
        return acc
      }, {})
    },
  },
  created () {
    if (process.client) {
      this.$bus.$on('resize', this.resizeMain)
    }
    this.prepareAndAssignDataRows()

    this.tally = Object.assign({}, this.startingTally)
  },
  beforeDestroy() {
    if (process.client) {
      this.$bus.$off('resize')
    }
  },
  methods: {
    resizeMain() {
      console.log('Resizing main...')
      //console.log(this.$refs['header-controls'].getBoundingClientRect().height)

      let windowHeight = window.innerHeight

      if (this.dataRows.length) {
        let headerHeight = this.$refs['status-bar'].getBoundingClientRect().height + this.$refs['status-bar'].getBoundingClientRect().top

        try {
          this.$refs['timecard-container'].style.height = `${windowHeight - headerHeight}px`
        } catch (e) {}
      }
    },
    async autoFill() {
      return await this.$axios
        .post(`/payroll/salesforce/autofill`, {
          Weekending: this.weekending,
          supplier: this.$parent.supplier
        })
        .then(({ data }) => {
          alert(`Autofill completed for ${data.autofilledPayrollFolders} timecards!${(data.skippedPlacements && ` (Skipped ${data.skippedPlacements})`) || ''}`)
          //return this.refreshResult()
        })
        .catch(e => {
          console.log(e)
          alert('Error!')
        })
    },
    prepareAndAssignDataRows() {
      

      this.generateFilters()

      for (let x in this.dataRows) {
        if (!this.dataRows[x]) continue

        
        this.$set(this.dataRows[x], 'unsaved', null)
        this.$set(this.dataRows[x], 'saved', null)
        this.$set(this.dataRows[x], 'saving', null)
        this.$set(this.dataRows[x], 'shownonbillable', null)
        this.$set(this.dataRows[x], 'correction', this.period == 'day' && this.formattedWeekendingOrDay)
        this.$set(this.dataRows[x], 'payRate', Number((this.dataRows[x].Compensation__r && this.dataRows[x].Compensation__r.Default_Pay_Rate__c) || this.dataRows[x].AVTRRT__Pay_Rate__c || 0))
        this.$set(this.dataRows[x], 'OTRate', Number((this.dataRows[x].Compensation__r && this.dataRows[x].Compensation__r.Default_OT_Pay_Rate__c) || this.dataRows[x].Overtime_Pay_Rate__c || 0))
      }

      //console.log(this.dataRows, '<< dataRows')

      this.formattingData = false

      this.$nextTick(this.resizeMain)
    },
    generateFilters() {
      //let payType = row.AVTRRT__Contact_Candidate__r && row.AVTRRT__Contact_Candidate__r.Pay_Type__c

      this.filters.payType = this.dataRows
        .reduce(
          (acc, row) => [
            ...acc,
            {
              label: row && row.AVTRRT__Contact_Candidate__r && row.AVTRRT__Contact_Candidate__r.Pay_Type__c,
              active: true
            }
          ],
          []
        )
        .filter((el, idx, self) => self.map(el => el.label).indexOf(el.label) == idx)
        .sort((a, b) => (a > b ? 1 : -1))
      this.filters.shift = this.dataRows
        .reduce((acc, row) => [...acc, { label: row && row.Shift__c, active: true }], [])
        .filter((el, idx, self) => self.map(el => el.label).indexOf(el.label) == idx)
        .sort((a, b) => (a > b ? 1 : -1))
      this.filters.client = this.dataRows
        .reduce((acc, row) => [...acc, { label: row && row.AVTRRT__Employer__r.Name, active: true }], [])
        .filter((el, idx, self) => self.map(el => el.label).indexOf(el.label) == idx)
        .sort((a, b) => (a > b ? 1 : -1))
    },
    startSaveTimer(row) {
      //return console.log('starting timer...')

      row.unsaved = true
      //this.$set(this.unsaved, id, true)
      //this.$set(this.saved, id, false)
      clearTimeout(this.saveTimers[row.id])

      this.saveTimers[row.id] = setTimeout(() => this.save(row), 2000)
    },
    async save(row) {
      //console.log(row)
      //return

      row.saving = true
      row.Weekending = this.weekending

      await this.$axios
        .post(`/payroll/salesforce/update`, row, {
          headers: { 'Content-type': 'application/json' }
        })
        .then(({ data }) => {
          // data = {payrollFolderId, timeTrackObjs}
          //console.log(resp.data)
          if (!row.folder) this.$set(row, 'folder', { Id: data.payrollFolderId })
          row.unsaved = null
          row.saving = null
          row.saved = true

          console.log(data)

          let validTimeTracks = data.timeTrackObjs.filter(el => !!el)

          for (let timeTrack of validTimeTracks) {
            timeTrack.Id = timeTrack.id || timeTrack.Id

            let timeTracking = row.timeTracks[timeTrack.billingType].find(el => el.type == timeTrack.type && el.date == timeTrack.date)

            timeTracking.id = timeTrack.id
            timeTracking.notes = timeTrack.notes
            timeTracking.customNotes = timeTrack.customNotes

            if (timeTrack.qb) {
              let updateIdx = this.tally.toUpdate.map(el => el.Id).indexOf(timeTrack.id)
              let deleteIdx = this.tally.toDelete.map(el => el.Id).indexOf(timeTrack.id)

              //if (updateIdx > -1 && !timeTrack.op) this.tally.toUpdate.splice(updateIdx, 1)

              if (timeTrack.op == 'DELETE') {
                row.timeTracks[timeTrack.billingType][timeTrack.timeType].hours = '0'

                if (this.tally) {
                  if (updateIdx > -1) this.tally.toUpdate.splice(updateIdx, 1)
                  if (deleteIdx == -1) this.tally.toDelete.push(timeTrack)
                }
              } else if (this.tally && timeTrack.op == 'UPDATE') {
                if (deleteIdx > -1) this.tally.toDelete.splice(deleteIdx, 1)
                if (updateIdx == -1) this.tally.toUpdate.push(timeTrack)
              }
            } else {
              if (timeTrack.op == 'DELETE') {
                timeTracking.hours = ''
                timeTracking.notes = ''
                timeTracking.id = null
              }

              if (this.tally) {
                let createIdx = this.tally.toCreate.map(el => el.Id).indexOf(timeTrack.id)

                if (createIdx == -1 && timeTrack.op == 'CREATE') this.tally.toCreate.push(timeTrack)
                else if (createIdx > -1 && (timeTrack.op == 'DELETE' || !timeTrack.op)) this.tally.toCreate.splice(createIdx, 1)
              }
            }
          }

          setTimeout(() => (row.saved = null), 2000)
        })
        .catch(e => {
          row.unsaved = null
          row.saving = null
          console.log(e)
          alert(e.message)
        })
    }
  },
  watch: {
    
  }

}
</script>

<style lang="scss">
#status-bar {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  
  z-index: 1;
  border-bottom: 10px solid #eee;

  > div {
    max-width: 1400px;
    margin: auto;
    padding: 15px;
  }
}

#time-tracking-list {
  list-style: none;
  margin: 30px auto 50px;
  padding: 0;
  max-width: 1200px;
}

</style>