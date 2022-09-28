<template>
  <div class="container subpage">

    

      
    <div class="header-controls" ref="header-controls">

        <h2>Timecard Entry</h2>

        <div v-if="!startDate &&!(importingData || formattingData)" class="details">
          <div>
            <select v-model="supplier">
              <option value="">Select Company</option>
              <option value="YORK">York Search Group</option>
              <option value="QAJAQ">Qajaq Northern Builders</option>
            </select>
            <div id="input-type">
              <label for="single-day"><input type="radio" id="single-day" value="day" v-model="period">Specific Date</label>
              <label for="weekending"><input type="radio" id="weekending" value="weekending" v-model="period">Weekending</label>
            </div>

            <Datepicker v-if="period" v-model="weekendingOrDay" :disabled-dates="{days: period == 'weekending' ? [0,1,2,4,5] : []}" format="yyyy-MM-dd" :use-utc="true" />

            <div v-if="folders !== false">
              <select v-if="folders.length" v-model="folder">
                <option value="">Select Contractor</option>
                <option v-for="(folder, idx) in folders" :key="`folder-${idx}`" :value="folder.Id">{{folder.Name}}</option>
              </select>
              <span v-else>No payroll data for given date found!</span>
            </div>
            
            <button @click="initiateSalesforceImport" :disabled="!weekendingOrDay">Load Placements</button>
          </div>
        </div>

        <div v-else-if="importingData || formattingData" :key="importingData ? 'importing' : 'formatting'">
          <div class="loading-container" v-if="importingData"><Loader :message="`Importing Salesforce Data for ${moment.utc(weekendingOrDay).format('MMMM Do') + (period == 'weekending' ? ' weekending...' : '...')}`" /></div>
          <span v-else>Formatting Salesforce Data...</span>
        </div>

        

        <div v-else-if="!!dataRows">

          <div v-if="!Object.keys(dataRows).length" >There were no placements found between {{moment.utc(startDate).format('YYYY-MM-DD')}} and {{moment.utc(endDate).format('YYYY-MM-DD')}}</div>

          <div class="details" v-else>
            <b>Found {{dataRows.length}} active placements for {{supplier}} between {{moment.utc(startDate).format('YYYY-MM-DD')}} and {{moment.utc(endDate).format('YYYY-MM-DD')}} ({{weekday}})</b>
            &nbsp;&nbsp;&nbsp;
            <a @click="resetDates">Change Weekending/Company</a>
            &nbsp;
            <a @click="refreshResult">Refresh</a>
            &nbsp;
            <a @click="autoFill">Auto-fill</a>
            &nbsp;
          </div>

        </div>

    </div><!--heading-controls-->

        

        
<div id="bottom-container" ref="bottom-container" v-if="dataRows.length">
          
  <div id="console-container">
    <ConsolePayroll :tally="tally" />
  </div>

  <div id="main-container">
    

      <div id="status-bar" ref="status-bar">
        
        <TimecardFilters :filters="filters" />

        <div v-if="tally">
          Records to create: {{tally.toCreate.length}} ... 
          Records to update: {{tally.toUpdate.length}} ...
          Records to delete: {{tally.toDelete.length}} ...
          <button @click="queueQBQueries">Import to QB</button>
        </div>
        <div><input type="text" v-model="searchTerm" placeholder="Name Search"></div>
        
      </div>


      <section class="time-tracker-scrolling-container" ref="timecard-container">

        <ul id="time-tracking-list">

          <PayrollItem 
            v-for="(row, idx) in filteredDataRows" 
            :key="`placement-${idx}`" 
            :row="row"
            @row-change="startSaveTimer"
            :class="[
              {
                unsaved: row.unsaved, 
                saved: row.saved, 
                saving: row.saving, 
                imported: row.folder && row.folder.Imported_to_QB__c, 
                shownonbillable: row.shownonbillable
              }, 
              row.AVTRRT__Contact_Candidate__r.Pay_Type__c || 'undefined'
            ]" 
          />
          
        </ul>

      </section>
    
    
  </div>

</div><!--end v-if datarows.length-->

  
            
        </div>

      
    
  
</template>

<script>
import ConsolePayroll from '~/components/ConsolePayroll'
import PayrollItem from '~/components/PayrollItem'
import moment from 'moment'
import MaxMin from '~/components/ui/MaxMin'
import Loader from '~/components/ui/Loader'
import TimecardFilters from '~/components/timecards/TimecardFilters'


export default {
  components: {
    ConsolePayroll,
    PayrollItem,
    MaxMin,
    Loader,
    TimecardFilters
  },
  data () {
    return {
      importingData: false,
      formattingData: false,
      dataRows: false,
      unsaved: {},
      saveTimers: {},
      startDate: false,
      endDate: false,
      weekendingOrDay: '',
      weekday: '',
      supplier: 'YORK',
      tally: [],
      moment,
      activeNoteId: false,
      filters: {
        payType: [],
        client: [],
        shift: []
      },
      period: '',
      folders: false,
      folder: '',
      searchTerm: ''
    }
  },
  created () {
    if (process.client) {
      
      this.$bus.$on('resize', this.resizeMain)
    }
    this.$axios.defaults.baseURL = this.$bus.servers[process.env.NODE_ENV].payroll
  },
  beforeDestroy () {
    if (process.client) {
      
      this.$bus.$off('resize')
    }
  },
  mounted () {
    //alert(this.$axios.defaults.baseURL)
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
   formattedWeekendingOrDay () {
     return this.weekendingOrDay && this.weekendingOrDay.toISOString().substring(0,10)
   },
   activeFilters () {

    return Object.keys(this.filters).reduce((acc, _type) => {
      if (!acc[_type]) acc[_type] = []
      acc[_type] = this.filters[_type].filter(el => el.active).map(el => el.label)
      return acc
    }, {})
  },

   
    filteredDataRows () {

      if (!this.dataRows) return []

      
      
      //console.log(activePayTypes, '<< activePayTypes')
      //console.log(activeClients, '<< activeClients')


      return this.dataRows
        .filter(row => row && this.activeFilters.payType.indexOf(row.AVTRRT__Contact_Candidate__r && row.AVTRRT__Contact_Candidate__r.Pay_Type__c) > -1)
        .filter(row => row && this.activeFilters.client.indexOf(row.AVTRRT__Employer__r.Name) > -1)
        .filter(row => row && this.activeFilters.shift.indexOf(row.Shift__c) > -1)
        .filter(row => !this.searchTerm || row && row.AVTRRT__Contact_Candidate__r && row.AVTRRT__Contact_Candidate__r.Name.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1)
    },
    
    
    nToCreate () {
      return 0
      //return Object.keys(this.tally.toCreate).reduce((sum, key) => sum += this.tally.toCreate[key].length, 0)
    },
    nToUpdate () {
      return 0
      //return Object.keys(this.tally.toUpdate).reduce((sum, key) => sum += this.tally.toUpdate[key].length, 0)
    }
  },
  methods: {
    
    resizeMain () {
      console.log('Resizing main...')
      console.log(this.$refs['header-controls'].getBoundingClientRect().height)
      
      let windowHeight = window.innerHeight
      

      if (this.dataRows.length) {

        let headerHeight = this.$refs['status-bar'].getBoundingClientRect().height + this.$refs['status-bar'].getBoundingClientRect().top

        try {
          this.$refs['timecard-container'].style.height =`${windowHeight - headerHeight}px`
        } catch (e) {}
      }
    },
    generateFilters () {

      //let payType = row.AVTRRT__Contact_Candidate__r && row.AVTRRT__Contact_Candidate__r.Pay_Type__c
      
      this.filters.payType = this.dataRows.reduce((acc, row) => [...acc, {label: (row && row.AVTRRT__Contact_Candidate__r && row.AVTRRT__Contact_Candidate__r.Pay_Type__c), active: true}], []).filter((el, idx, self) => self.map(el => el.label).indexOf(el.label) == idx).sort((a,b) => a > b ? 1 : -1)
      this.filters.shift = this.dataRows.reduce((acc, row) => [...acc, {label: row && row.Shift__c, active: true}], []).filter((el, idx, self) => self.map(el => el.label).indexOf(el.label) == idx).sort((a,b) => a > b ? 1 : -1)
      this.filters.client = this.dataRows.reduce((acc, row) => [...acc, {label: row && row.AVTRRT__Employer__r.Name, active: true}], []).filter((el, idx, self) => self.map(el => el.label).indexOf(el.label) == idx).sort((a,b) => a > b ? 1 : -1)

    },
    async queueQBQueries () {
      await this.$axios.post(`/payroll/quickbooks/update`, {weekendingOrDay: this.formattedWeekendingOrDay, period: this.period, supplier: this.supplier})
      .then(async ({data}) => console.log(data))
      .catch(e => {
        console.log(e)
        alert('Error!')
      })
    },
    
    
    resetDates () {
      this.weekendingOrDay = ''
      this.startDate = false
      this.dataRows = {}
    },
    refreshResult () {
      return this.initiateSalesforceImport()
    },
    async autoFill () {
      return await this.$axios.post(`/payroll/salesforce/autofill`,{Weekending: this.formattedWeekendingOrDay, supplier: this.supplier})
      .then(({data}) => {
        alert(`Autofill completed for ${data.autofilledPayrollFolders} timecards!${data.skippedPlacements && ` (Skipped ${data.skippedPlacements})` || ''}`)
        //return this.refreshResult()
      })
      .catch(e => {
        console.log(e)
        alert('Error!')
      })
    },
    async initiateSalesforceImport () {

      this.correction = false
      //this.prepareAndAssignDataRows([])

      if (!this.period) return alert('No period selected!')
      else console.log(this.period, '<< period selected')
      
      
      //alert(formattedWeekendingOrDay)

      this.importingData = true

      let _vm = this

      if (this.period == 'weekending') {

        await this.$axios.post(`/payroll/salesforce/import/weekending`,{Weekending: this.formattedWeekendingOrDay, supplier: this.supplier})
        .then(async ({data}) => {

          
          this.importingData = false
          this.formattingData = true
          await this.$forceUpdate()

          //console.log(this.importingData, this.formattingData)

          return data

          

        })
        .then(data => {
          //console.log('In here!')
      
          this.$nextTick(() => {
            this.startDate = new Date(data.start)
            this.endDate = new Date(data.end)
            this.weekday = data.weekday

            this.prepareAndAssignDataRows(data.placements)

            this.tally = data.tally
          })
        })
        .catch(e => {

          alert(e.response && e.response.data || e.message)
          this.importingData = false
          return false

        })
       
        

      } else {

        if (!this.folder) {// get all payroll folders{} for this specific day and supplier
          await this.$axios.post('/payroll/salesforce/import/day', {Date: this.formattedWeekendingOrDay, supplier: this.supplier})
          .then(({data}) => {
            this.folders = data
            this.importingData = false
          })
          .catch(e => {
            alert(e.response && e.response.data || e.message)
            this.importingData = false
          })
        } else {
          await this.$axios.post('/payroll/salesforce/import/day', {Date: this.formattedWeekendingOrDay, supplier: this.supplier, folder: this.folder})
          .then(({data}) => {
            this.correction = true

            this.tally = false//hide tally
            this.prepareAndAssignDataRows(data.placements)
            

            this.importingData = false

            return
          })
          .catch(e => {
            alert(e.response && e.response.data || e.message)
            this.importingData = false
          })
        }

      }

      
    },
    prepareAndAssignDataRows (placementsData) {

      this.dataRows = placementsData


      this.generateFilters()

      for(let x in this.dataRows) {

        if(!this.dataRows[x]) continue

        this.$set(this.dataRows[x], 'Weekending', this.period == 'day' && this.dataRows[x].folder.Weekending__c || this.formattedWeekendingOrDay)
        this.$set(this.dataRows[x], 'unsaved', null)
        this.$set(this.dataRows[x], 'saved', null)
        this.$set(this.dataRows[x], 'saving', null)
        this.$set(this.dataRows[x], 'shownonbillable', null)
        this.$set(this.dataRows[x], 'correction', this.period == 'day' && this.formattedWeekendingOrDay)
        this.$set(this.dataRows[x], 'payRate', Number((this.dataRows[x].Compensation__r && this.dataRows[x].Compensation__r.Default_Pay_Rate__c || this.dataRows[x].AVTRRT__Pay_Rate__c) || 0))
        this.$set(this.dataRows[x], 'OTRate', Number((this.dataRows[x].Compensation__r && this.dataRows[x].Compensation__r.Default_OT_Pay_Rate__c || this.dataRows[x].Overtime_Pay_Rate__c) || 0))
        
      }

      //console.log(this.dataRows, '<< dataRows')

      this.formattingData = false

      this.$nextTick(this.resizeMain)


    },
    startSaveTimer (row) {
      
      //return console.log('starting timer...')

      row.unsaved = true
      //this.$set(this.unsaved, id, true)
      //this.$set(this.saved, id, false)
      clearTimeout(this.saveTimers[row.id])

      this.saveTimers[row.id] = setTimeout(() => this.save(row), 2000)
    },
    async save (row) {
      //console.log(row)
      //return

      row.saving = true

      await this.$axios.post(`/payroll/salesforce/update`, row, {headers: {'Content-type': 'application/json'}})
      .then(({data}) => {// data = {payrollFolderId, timeTrackObjs}
        //console.log(resp.data)
        if (!row.folder) this.$set(row, 'folder', {Id: data.payrollFolderId})
        row.unsaved = null
        row.saving = null
        row.saved = true

        console.log(data)

        let validTimeTracks = data.timeTrackObjs.filter(el => !!el)
        

        for (let timeTrack of validTimeTracks) {

          timeTrack.Id = timeTrack.id || timeTrack.Id

          let timeTracking = row.timeTracks[timeTrack.billingType].find(el => el.type == timeTrack.type && el.date ==  timeTrack.date)

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
              
            } else if(this.tally && timeTrack.op == 'UPDATE') {
              
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

        

        setTimeout(() => row.saved = null, 2000)
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
      this.resizeMain()
    },
    weekendingOrDay (val) {
      this.folder = ''
      this.folders = false
      this.dataRows = false
      return val !== '' && this.weekendingOrDay.setUTCHours(12)
    },
    period () {
      this.weekendingOrDay = ''
    }
  }
}
</script>

<style lang="scss">

.header-controls {
  h2{
    margin-bottom: 15px;
  }

  padding: 15px 20px;
}

.details {
  height: 60px;
  display: flex;
  align-items: center;
}

#bottom-container{
  position: relative;
  width: 100%;
  height: auto;

  #console-container {
    width: 40%;
    display: none;
    bottom: 0;
    right: 0;
    position: absolute;
    margin: auto;
    overflow: auto;
    height: 100%;
    min-height: 100%;
  }


  #main-container{
    width: 100%;
    margin: auto;
    overflow: auto;
    position: relative;
    
    height: auto;
    font-size: .8rem;
  }
}

.time-tracker-scrolling-container{
  
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
  } to {
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
  &:hover{
    text-decoration: underline;
  }
}

#status-bar {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  padding: 0 30px;
  z-index: 10;
  border-bottom: 10px solid #eee;

  > div {
    max-width: 1400px;
    margin: auto;
    padding: 10px;
    
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
