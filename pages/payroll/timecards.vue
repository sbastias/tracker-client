<template>
  <div class="container subpage">

    <div class="header-controls" ref="header-controls">

      <h2>Timecards Management</h2>

      <div class="timecard-params">

        

        <div>
          <select v-model="supplier">
            <option value="">Select Company</option>
            <option value="YORK">York Search Group</option>
            <option value="QAJAQ">Qajaq Northern Builders</option>
          </select>
        

        <!--div id="input-type">
          <label for="weekending"><input type="radio" id="weekending" value="weekending" v-model="period" />Weekending</label>
        </div-->

        
        <client-only>
          
            <Datepicker
              class="inline" 
              v-model="weekendingOrDay"
              :disabled-dates="{
                days: period == 'weekending' ? [0, 1, 2, 4, 5] : []
              }"
              format="yyyy-MM-dd"
              :use-utc="true"
              @input="storeWeekending" />

              <button @click="clearFields">Reset</button>
          
        </client-only>

        </div>

        


          <!--div v-if="folders !== false">
            <select v-if="folders.length" v-model="folder">
              <option value="">Select Contractor</option>
              <option v-for="(folder, idx) in folders" :key="`folder-${idx}`" :value="folder.Id">{{ folder.Name }}</option>
            </select>
            <span v-else>No payroll data for given date found!</span>
          </div-->

          
        
      </div>

      
    </div>

    <div id="timecards-ui">
      
        <!--div class="details">          
          <button @click="resetDates">Change Weekending/Company</button>
        </div-->

        <div v-show="!(weekendingOrDay && supplier)">
          <b>Select Company and Weekending to manage Timecards, Quickbooks Time Entry Imports and Invoicing</b>
        </div>

        <div v-show="weekendingOrDay && supplier">
          <nav id="section-tabs">
            <ul>
              <n-link :to="{name: 'payroll-timecards-entries'}" v-slot="{navigate, isExactActive}" custom>
                <li @click="navigate" :class="{isExactActive}">Timecard Entries</li>
              </n-link>
              <n-link :to="{name: 'payroll-timecards-qb-import'}" v-slot="{navigate, isExactActive}" custom>
                <li @click="navigate" :class="{ isExactActive }">Quickbooks Import</li>
              </n-link>
              <n-link :to="{name: 'payroll-timecards-invoices'}" v-slot="{navigate, isExactActive}" custom>
                <li @click="navigate" :class="{ isExactActive }">Generate Invoices</li>
              </n-link>
              
            </ul>
          </nav>

          <n-child keep-alive :weekending-raw="weekendingOrDay" :supplier="supplier" />

        </div>
      
    </div>

    

  </div>
</template>

<script>

import Loader from '~/components/ui/Loader'
import moment from 'moment'
import { mapGetters } from 'vuex'
import path from 'path'

export default {
  components: {
    Loader
  },
  data() {
    return {
      importingData: false,
      
      startDate: false,
      endDate: false,
      weekendingOrDay: '',
      weekday: '',
      moment,
      period: 'weekending',
      folders: false,
      folder: '',
      supplier: this.storedSupplier,
      env: process.env.NODE_ENV
    }
  },
  created() {

    this.supplier = this.storedSupplier || ''
    this.weekendingOrDay = this.storedWeekending && new Date(this.storedWeekending) || ''

    if (process.client) {
      this.$bus.$on('resize', this.resizeMain)
    }
    
  },
  beforeDestroy() {
    if (process.client) {
      this.$bus.$off('resize')
    }
  },
  mounted() {
    //alert(this.$axios.defaults.baseURL)
    console.log(process.env.NODE_ENV)
    this.$axios.defaults.baseURL = this.$bus.servers[process.env.NODE_ENV].payroll

    //if (!this.storedWeekending && this.$route.name != 'payroll-timecards') this.$router.push({name: 'payroll-timecards'})
    //else this.weekendingOrDay = new Date(this.storedWeekending)
    
  },
  computed: {
    ...mapGetters(['storedWeekending','storedSupplier']),
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
    clearFields () {
      this.weekendingOrDay = ''
      this.supplier = false
      this.$store.commit('STORE_WEEKENDING', false)
    },
    storeWeekending () {
      this.$store.commit('STORE_WEEKENDING', this.weekendingOrDay)
    },
    switchTab (tab) {
      console.log(tab)
      console.log(this.$route.params.tab)
      this.$router.replace(this.$route.path.replace(this.$route.params.tab, tab))
    },
    resizeMain () {},
    
    

    resetDates() {
      this.weekendingOrDay = ''
      this.startDate = false
      
    },
    
    
    
  },
  watch: {
    
    weekendingOrDay(val) {
      this.folder = ''
      this.folders = false
      this.dataRows = false

      if (val !== '') {
        this.weekendingOrDay.setUTCHours(12)
        this.$store.commit('STORE_WEEKENDING', val)
      }
      
    },
    supplier (val) {
      this.$store.commit('STORE_SUPPLIER', val)
    },
    period() {
      this.weekendingOrDay = ''
    },
    
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
    //margin-bottom: 15px;
  }

  padding: 15px 20px;
}

#timecards-ui {
  padding: 0 20px;
}

.timecard-params {
  margin-top: 30px;
}

div.details {//must be div! ul.details used in Tracker.
  height: 40px;
  margin-bottom: 20px;
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
  border-bottom: 1px solid #ccc;
  li {
    display: block;
    padding: 8px 10px;
    border: 1px solid #ccc;
    border-bottom-color: white;
    transform: translateY(1px);
    background: #eee;
    cursor: pointer;
    &.isExactActive {
      font-weight: bold;
      background: white;
    }
  }
}
margin-bottom: 20px;
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
