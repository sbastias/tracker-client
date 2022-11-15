<template>
  <section id="timecard-entry-ui">
    
    <div v-if="importingData" :key="importingData ? 'importing' : 'formatting'">
      <div class="loading-container">
        <Loader :message="`Importing Timecard Data for ${moment.utc(weekending).format('MMMM Do')} weekending...`" />
      </div>
    </div>

    <div v-else-if="!dataRows">
      <button @click="initiateSalesforceImport">Load Timecard Entries</button>
    </div>

    <div v-else>

      <div id="action-button-bar">
        <button @click="refreshResult">Refresh Results</button>
        <button @click="autoFill" v-show="!externalUser">Auto-fill</button>
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

            <TimecardFilters :filters="filters" v-show="showFilters" :maximized="showFilters" @toggle="toggleFilter" />  
            
          </div>
          

          <section class="time-tracker-scrolling-container" ref="timecard-container">
            <ul id="time-tracking-list">
              <Timecard
                v-for="(row, idx) in dataRows"

                v-show="activeFilters.payType.indexOf(row.AVTRRT__Contact_Candidate__r && row.AVTRRT__Contact_Candidate__r.Pay_Type__c) > -1
                && activeFilters.client.indexOf(row.AVTRRT__Employer__r.Name) > -1
                && activeFilters.shift.indexOf(row.Shift__c) > -1
                && ((showSynced && row.folder && !row.folder.doNotSync) ||  (showNotSynced && (!row.folder || row.folder.doNotSync)))
                && (searchTerm.length > 2 && row.AVTRRT__Contact_Candidate__r && row.AVTRRT__Contact_Candidate__r.Name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1 || searchTerm.length < 3)"

                :weekending="weekending"
                :key="`placement-${idx}`"
                :row="row"
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
  props: ['weekending-raw','supplier','externalUser'],
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
      tally: {},
      showSynced: true,
      showNotSynced: true
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
    weekending () {
      return this.weekendingRaw && this.weekendingRaw.toISOString().substring(0,10)
    }
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
    toggleFilter (field) {
      console.log('toggling', field)
      this[field] = !this[field]
    },
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
          supplier: this.supplier
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
            supplier: this.supplier,
            client: this.externalUser && this.externalUser.Account.Id,
            departments: this.externalUser && this.externalUser.Reporting_Departments__c,
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