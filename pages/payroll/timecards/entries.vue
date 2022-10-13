<template>
  <section id="timecard-entry-ui">

    <div v-if="importingData" :key="importingData ? 'importing' : 'formatting'">
      <div class="loading-container">
        <Loader :message="`Importing Salesforce Data for ${moment.utc(weekending).format('MMMM Do')} weekending...`" />
      </div>
    </div>

    <div v-else-if="!dataRows">
      <button @click="initiateSalesforceImport">Load Timecard Entries</button>
    </div>

    <div v-else>

      <div id="action-button-bar">
        <button @click="refreshResult">Refresh Results</button>
        <button @click="autoFill">Auto-fill</button>
      </div>

      <div v-if="autofillingData">
        <div class="loading-container">
          <Loader :message="`Auto-filling timecards... Please wait...`" />
        </div>
      </div>
    
      

      <div v-if="!dataRows.length">
        There were no placements found between
        {{ moment.utc(startDate).format('YYYY-MM-DD') }} and
        {{ moment.utc(endDate).format('YYYY-MM-DD') }}
      </div>

      <div v-else id="bottom-container" ref="bottom-container">
        <div id="main-container">

          <div ref="status-bar" style="background: #eee;">

            <div class="search-bar timecards">
              <div class="search-field-container">
                <input class="search-field" type="text" v-model="searchTerm" placeholder="Name Search" />
              </div>

              <h3 class="max-min-label"><span>Filters</span> <MaxMin @click="showFilters = !showFilters" :maximized="showFilters" :width-px="15" /></h3>
            </div>

            <TimecardFilters :filters="filters" v-show="showFilters" :maximized="showFilters" />  
            
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

    </div>
    
  </section>
</template>

<script>
import Timecard from '~/components/timecards/Timecard'
import TimecardFilters from '~/components/timecards/TimecardFilters'
import MaxMin from '~/components/ui/MaxMin'
import Loader from '~/components/ui/Loader'
import moment from 'moment'

export default {
  props: ['weekending','supplier'],
  components: {Timecard, TimecardFilters, Loader, MaxMin},
  data () {
    return {
      dataRows: false,
      importingData: false,
      autofillingData: false,
      searchTerm: '',
      showFilters: false,
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
          this.$refs['timecard-container'].style.height = `${windowHeight - headerHeight - 10}px`
        } catch (e) {}
      }
    },
    async autoFill() {

      this.autofillingData = true

      return await this.$axios
        .post(`/payroll/salesforce/autofill`, {
          Weekending: this.weekending,
          supplier: this.$parent.supplier
        })
        .then(({ data }) => {
          this.$bus.$emit('toaster', {status: 'success', message: `Autofill completed for ${data.autofilledPayrollFolders} timecards!${(data.skippedPlacements && ` (Skipped ${data.skippedPlacements})`) || ''}`})
        })
        .catch(e => {
          console.log(e)
          this.$bus.$emit('toaster', {status: 'error', message: `Error!`})
        })
        .finally(() => this.autofillingData = false)
    },

    refreshResult() {
      return this.initiateSalesforceImport()
    },
    
    async initiateSalesforceImport() {
      this.correction = false
      //this.prepareAndAssignDataRows([])

      //if (!this.period) return alert('No period selected!')
      //else console.log(this.period, '<< period selected')

      //alert(formattedWeekendingOrDay)

      this.importingData = true

      let _vm = this

      //if (this.period == 'weekending') {
        await this.$axios
          .post(`/payroll/salesforce/import/weekending`, {
            Weekending: this.weekending,
            supplier: this.supplier
          })
          .then(async ({ data }) => {
            this.importingData = false
            
            await this.$forceUpdate()

            

            return data
          })
          .then(data => {
            //console.log('In here!')

            
              this.startDate = new Date(data.start)
              this.endDate = new Date(data.end)
              this.weekday = data.weekday
              this.tally = data.tally
              this.dataRows = data.placements
              this.$nextTick(this.prepareAndAssignDataRows)

          })
          .catch(e => {
            alert((e.response && e.response.data) || e.message)
            this.importingData = false
            return false
          })
          /*
      } else {
        if (!this.folder) {
          // get all payroll folders{} for this specific day and supplier
          await this.$axios
            .post('/payroll/salesforce/import/day', {
              Date: this.formattedWeekendingOrDay,
              supplier: this.supplier
            })
            .then(({ data }) => {
              this.folders = data
              this.importingData = false
            })
            .catch(e => {
              alert((e.response && e.response.data) || e.message)
              this.importingData = false
            })
        } else {
          await this.$axios
            .post('/payroll/salesforce/import/day', {
              Date: this.formattedWeekendingOrDay,
              supplier: this.supplier,
              folder: this.folder
            })
            .then(({ data }) => {
              this.correction = true

              this.tally = false //hide tally
              this.importingData = false

              return
            })
            .catch(e => {
              alert((e.response && e.response.data) || e.message)
              this.importingData = false
            })
        }
      }
      */
    },

    prepareAndAssignDataRows() {
      

      this.generateFilters()

      for (let x in this.dataRows) {
        if (!this.dataRows[x]) continue

        
        this.$set(this.dataRows[x], 'unsaved', null)
        this.$set(this.dataRows[x], 'saved', null)
        this.$set(this.dataRows[x], 'saving', null)
        this.$set(this.dataRows[x], 'shownonbillable', null)
        //this.$set(this.dataRows[x], 'correction', this.period == 'day' && this.formattedWeekendingOrDay)
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
    showFilters () {
      this.$nextTick(() => this.$bus.$emit('resize'))
    }
  }

}
</script>

<style lang="scss">
#status-bar { //filter and search container
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1;

  > div{

    &:first-child {
      max-width: 1400px;
      margin: auto;
      padding: 15px;
    }
    &:last-child {
      height: 100%;
      position: absolute;
      display: flex;
      align-items: center;
      right: 20px; top: 0;
    }
  }
}

#action-button-bar {

}

.time-tracker-scrolling-container {

  margin-top: 10px;

  #time-tracking-list {
    list-style: none;
    margin: 30px auto 50px;
    padding: 0;
    max-width: 1200px;
  }

}

</style>