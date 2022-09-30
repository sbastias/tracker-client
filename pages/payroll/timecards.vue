<template>
  <div class="container subpage">
    <div class="header-controls" ref="header-controls">
      <h2>Timecards Management</h2>

      <div v-if="!startDate && !importingData" class="details">
        <div>
          <select v-model="supplier">
            <option value="">Select Company</option>
            <option value="YORK">York Search Group</option>
            <option value="QAJAQ">Qajaq Northern Builders</option>
          </select>
          <div id="input-type">
            <label for="single-day"><input type="radio" id="single-day" value="day" v-model="period" />Specific Date</label>
            <label for="weekending"><input type="radio" id="weekending" value="weekending" v-model="period" />Weekending</label>
          </div>

          <Datepicker
            v-if="period"
            v-model="weekendingOrDay"
            :disabled-dates="{
              days: period == 'weekending' ? [0, 1, 2, 4, 5] : []
            }"
            format="yyyy-MM-dd"
            :use-utc="true"
          />

          <div v-if="folders !== false">
            <select v-if="folders.length" v-model="folder">
              <option value="">Select Contractor</option>
              <option v-for="(folder, idx) in folders" :key="`folder-${idx}`" :value="folder.Id">{{ folder.Name }}</option>
            </select>
            <span v-else>No payroll data for given date found!</span>
          </div>

          <button @click="initiateSalesforceImport" :disabled="!weekendingOrDay">
            Load Placements
          </button>
        </div>
      </div>

      <div v-else-if="importingData" :key="importingData ? 'importing' : 'formatting'">
        <div class="loading-container">
          <Loader :message="`Importing Salesforce Data for ${moment.utc(weekendingOrDay).format('MMMM Do') + (period == 'weekending' ? ' weekending...' : '...')}`" />
        </div>
      </div>
    </div>

    <div v-if="!!dataRows" id="timecards-ui">
      
      <div v-if="!dataRows.length">
        There were no placements found between
        {{ moment.utc(startDate).format('YYYY-MM-DD') }} and
        {{ moment.utc(endDate).format('YYYY-MM-DD') }}
      </div>

      <div v-else>

        <div class="details">          
          <a @click="resetDates">Change Weekending/Company</a>
          &nbsp;
          <a @click="refreshResult">Refresh</a>
        </div>

        <nav id="section-tabs">
          <ul>
            <n-link :to="{name: 'payroll-timecards-entries'}" v-slot="{navigate}" custom>
              <li @click="navigate">Timecard Entries</li>
            </n-link>
            <n-link :to="{name: 'payroll-timecards-qb-import'}" v-slot="{navigate}" custom>
              <li @click="navigate">Quickbooks Import</li>
            </n-link>
            
          </ul>
        </nav>

        <n-child keep-alive :data-rows="dataRows" :tally="tally" />

        
      </div>
    </div>
  </div>
</template>

<script>
import TimecardFilters from '~/components/timecards/TimecardFilters'
import TimecardConsole from '~/components/timecards/TimecardConsole'
import PayrollItem from '~/components/timecards/PayrollItem'
import MaxMin from '~/components/ui/MaxMin'
import Loader from '~/components/ui/Loader'
import moment from 'moment'

export default {
  components: {
    TimecardConsole,
    PayrollItem,
    MaxMin,
    Loader,
    TimecardFilters
  },
  data() {
    return {
      importingData: false,
      dataRows: false,
      startDate: false,
      endDate: false,
      weekendingOrDay: '',
      weekday: '',
      supplier: 'YORK',
      tally: [],
      moment,
      period: '',
      folders: false,
      folder: ''
    }
  },
  created() {
    if (process.client) {
      this.$bus.$on('resize', this.resizeMain)
    }
    this.$axios.defaults.baseURL = this.$bus.servers[process.env.NODE_ENV].payroll
  },
  beforeDestroy() {
    if (process.client) {
      this.$bus.$off('resize')
    }
  },
  mounted() {
    //alert(this.$axios.defaults.baseURL)
    console.log(this.$route)
  },
  computed: {
    /*
    lastSaturday () {

      let today = new Date()
      let dayOfWeek = today.getUTCDay()
      let daysSinceLastSaturday = (dayOfWeek + 1) % 7

      console.log(`It's been ${daysSinceLastSaturday} days since last Saturday...`)

      let lastSaturday = new Date(today.toISOString().substring(0,10))
      lastSaturday.setUTCDate(lastSaturday.getUTCDate() - daysSinceLastSaturday)

      return lastSaturday.toISOString().substring(0,10)
    },
    */
    formattedWeekendingOrDay() {
      return this.weekendingOrDay && this.weekendingOrDay.toISOString().substring(0, 10)
    },
    

    

    nToCreate() {
      return 0
      //return Object.keys(this.tally.toCreate).reduce((sum, key) => sum += this.tally.toCreate[key].length, 0)
    },
    nToUpdate() {
      return 0
      //return Object.keys(this.tally.toUpdate).reduce((sum, key) => sum += this.tally.toUpdate[key].length, 0)
    }
  },
  methods: {
    switchTab (tab) {
      console.log(tab)
      console.log(this.$route.params.tab)
      this.$router.replace(this.$route.path.replace(this.$route.params.tab, tab))
    },
    resizeMain () {},
    
    

    resetDates() {
      this.weekendingOrDay = ''
      this.startDate = false
      this.dataRows = {}
    },
    refreshResult() {
      return this.initiateSalesforceImport()
    },
    
    async initiateSalesforceImport() {
      this.correction = false
      //this.prepareAndAssignDataRows([])

      if (!this.period) return alert('No period selected!')
      else console.log(this.period, '<< period selected')

      //alert(formattedWeekendingOrDay)

      this.importingData = true

      let _vm = this

      if (this.period == 'weekending') {
        await this.$axios
          .post(`/payroll/salesforce/import/weekending`, {
            Weekending: this.formattedWeekendingOrDay,
            supplier: this.supplier
          })
          .then(async ({ data }) => {
            this.importingData = false
            
            await this.$forceUpdate()

            

            return data
          })
          .then(data => {
            //console.log('In here!')

            this.$nextTick(() => {
              this.startDate = new Date(data.start)
              this.endDate = new Date(data.end)
              this.weekday = data.weekday
              this.tally = data.tally
              this.dataRows = data.placements
            })
          })
          .catch(e => {
            alert((e.response && e.response.data) || e.message)
            this.importingData = false
            return false
          })
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
    },
    
    
  },
  watch: {
    
    weekendingOrDay(val) {
      this.folder = ''
      this.folders = false
      this.dataRows = false
      return val !== '' && this.weekendingOrDay.setUTCHours(12)
    },
    period() {
      this.weekendingOrDay = ''
    },
    '$route.params' (val) {
      console.log(val)
      console.log(this.$route)
    }
  }
}
</script>

<style lang="scss">
#console-container {
  display: block;
  right: 0;
  position: relative;
  width: 100%;
  margin: auto;
  overflow: auto;
  z-index: 10;
  height: 300px;
  overflow: scroll;
}

.header-controls {
  h2 {
    margin-bottom: 15px;
  }

  padding: 15px 20px;
}

#timecards-ui {
  padding: 0 20px;
}
.details {
  height: 60px;
  display: flex;
  align-items: center;
}

#bottom-container {
  position: relative;
  width: 100%;
  height: auto;

  #main-container {
    width: 100%;
    margin: auto;
    overflow: auto;
    position: relative;

    height: auto;
    font-size: 0.8rem;
  }
}

.time-tracker-scrolling-container {
  overflow: auto;
  height: 100%;
  padding: 0 30px;

  /*
.time-tracker {
  font-size: 10px;
  min-width: 2200px;
  margin: 0 30px;

  th {
    background: #ddd;
  }

  th, tr {
    display: grid;
    grid-template-columns: 1.25fr 1.75fr .75fr 1.5fr 1.5fr 1fr .75fr .75fr .5fr .5fr .5fr 2fr 1fr 2fr;
    text-align: left;

    &.unsaved {
      background: #eee;
    }
    
    td{

      padding: 5px;

      input, textarea {
        width: 100%;

        &[type=number] {
          appearance: textfield;
        }
      }
    }
  }}*/
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  appearance: none;
  margin: 0;
}

.actions {
  margin-top: 15px;
  li {
    cursor: pointer;
    color: rgb(20, 147, 183);
  }
}

@keyframes saving {
  from {
    background-position-x: 0;
    opacity: 0.2;
  }
  to {
    background-position-x: -61px;
    opacity: 0.2;
  }
}

#time-tracking-list {
  list-style: none;
  margin: 0 auto 50px;
  padding: 0;
  max-width: 1200px;
}

a {
  color: rgb(36, 146, 242);
  text-decoration: none;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}



#section-tabs{
  ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  li {
    display: block;
    padding: 8px 10px;
  }
}
}

.pay-type {
  color: red;
}
.Incorporated .pay-type {
  color: orange;
}
.Non-Incorporated .pay-type {
  color: olive;
}
.Staff .pay-type {
  color: rgb(0, 128, 60);
}
</style>
