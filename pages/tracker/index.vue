<template>
  <div class="container">

    <TrackerOverlay 
      v-if="overlayMode"
      :mode="overlayMode" 
      :placement="overlayPlacement"  
      @cancel-overlay="cancelOverlay"
      @update-row="doRowUpdate"
      @insert-row="doRowInsert"
      @prepend-row="doRowPrepend"
    />

    <div v-show="!$bus.fullscreen">
      <h1>Tracker</h1>      
    </div>
    

    <div class="main-content">

      <div v-if="Object.keys(emitErrors).length">{{emitErrors}}</div>

      <client-only>
      <section id="date-range-new-order">
        <div>
          From
          <select v-model="params.range.startOrEndFrom">
            <option value="AVTRRT__Start_Date__c >=">Start Date</option>
            <option value="AVTRRT__End_Date__c >=">End Date</option>
          </select> <Datepicker class="inline" v-model="params.range.fromDate" name="from-date" format="yyyy-MM-dd" :use-utc="true" />
          to
          <select v-model="params.range.startOrEndTo">
            <option value="AVTRRT__Start_Date__c <=">Start Date</option>
            <option value="AVTRRT__End_Date__c <=">End Date</option>
          </select> <Datepicker class="inline" v-model="params.range.toDate" name="to-date" format="yyyy-MM-dd" :use-utc="true" />
          <button @click="loadData">Load Placements</button>
        </div>
        
        <div>
          <span v-show="!!placements">Displaying {{placements.length}} placements</span>
          <span>&nbsp;&nbsp;<a @click="$bus.toggleFullscreen"><span v-if="$bus.fullscreen">Exit </span>Full Screen Mode</a></span>
        </div>

        <div>
          <button style="height: auto" v-show="$bus.accounts" @click="addPlacement">Add New Order</button>
        </div>
        
      </section>
      </client-only>

      <div v-if="!!placements">

        <section class="search-bar tracker">
          <div class="search-field-container">
            <input type="text" v-model="textSearch" class="search-field" />
          </div>
          <h3 class="max-min-label"><span>Filters</span> <MaxMin @click="showFilters = !showFilters" :maximized="showFilters" :width-px="15" /></h3>
          <h3 id="max-min-label"><span>Columns</span> <MaxMin @click="showColumns = !showColumns" :maximized="showColumns" :width-px="15" /></h3>
        </section>

        <section id="toggleable-columns" v-if="!!placements && showColumns">
          <b style="font-size: .6rem;">Customize Columns</b>&nbsp;&nbsp;
          <span v-for="(column, idx) in toggleableColumns" :key="`toggle-col-${idx}`" @click="column.toggle = !column.toggle" class="column-toggle" :class="{active: !!column.toggle}">{{column.label}}</span>
        </section>

        <TrackerFilters v-show="!!placements && showFilters" :filters="params.filters" :maximized="showFilters" />

      </div>
      
      <div class="loading-container" v-if="loadingData"><Loader message="Loading Placements..." /></div>
      

      <section id="placements" ref="placements" :class="{disabled: loadingData}">

        <table id="placements-table" v-show="placements.length" cellspacing="0">
          <thead>
            <tr>
              <th @click="sortBy" :data-sort="col.field" v-for="(col, idx) in activeColumns" :class="{sortable: col.sortable, sorted: sortedBy == col.field}" :key="`col-${idx}`" :style="{width: col.width + 'px'}">
                {{col.label}}
                <Sort v-if="col.sortable" :direction="sortedBy == col.field && (ascending && 'asc' || 'desc')" />
              </th>
            </tr>
          </thead>
          
          <TrackerRow 
            v-for="(placement, idx) in placements" 
            :key="placement.Id" :id="`placement-${idx}`"
            :placement="placement"
            :active="activatedPlacement == placement"
            :active-columns="activeColumns"
            :width="tableWidth"
            @toggle-row="toggleRow" 
            @update="updatePlacement"
            @extend="extendPlacement"
            @assign="assignStaffer"
            @hire="hireStaffer"
            @reopen="removeStaffer"
            
          />
          
        </table>


      </section>

    </div>

  </div>
</template>

<script>
import TrackerRow from '~/components/tracker/TrackerRow'
import PlacementControls from '~/components/PlacementControls'
import TrackerOverlay from '~/components/tracker/TrackerOverlay'
import Loader from '~/components/ui/Loader'
import Sort from '~/components/ui/Sort'
import trackerColumnsConfig from '~/config/tracker/columns'
import trackerFiltersConfig from '~/config/tracker/filters'
import TrackerFilters from '~/components/tracker/TrackerFilters'
import moment from 'moment'
import MaxMin from '~/components/ui/MaxMin'

class rangeObj  {
  constructor () {

    this.fromDate = ((date) => {
      date.setDate(date.getDate() - 21)
      return date
    })(new Date())

    this.toDate = ((date) => {
      date.setMonth(date.getMonth() + 3)
      return date
    })(new Date())

    this.startOrEndFrom = 'AVTRRT__Start_Date__c >='
    this.startOrEndTo = 'AVTRRT__Start_Date__c <='

    
  }
}

class filterObj {
  constructor (label, field) {
    this.label = label
    this.field = field
    this.values = {}

    
  }
  set setVals (val) {
    for (let key in this.values) this.values[key] = val
  }
  selectAll () {
    this.setVals = true
  }
  deselectAll () {
    this.setVals = false
  }
  allSelected () {
    let allSelected = true
    for (let key in this.values) if (!this.values[key]) allSelected = false
    return allSelected
  }
}

export default {
  head: {
    title: 'Tracker'
  },
  components: {
    TrackerRow,
    PlacementControls,
    TrackerOverlay,
    TrackerFilters,
    Loader,
    Sort,
    MaxMin
  },
  data () {
    return {
      trackerColumnsConfig,
      params: {
        range: new rangeObj(),
        filters: []
      },
      metadata: false,
      unfilteredPlacements: [],
      textSearch: '',
      activatedPlacement: false,
      moment,
      overlayMode: false,
      overlayPlacement: false,
      loadingData: false,
      sortedBy: false,
      ascending: true,
      tableWidth: '100%',
      //offsetLeft: 0,
      emitErrors: {},
      showFilters: true,
      showColumns: true
    }
  },
  computed: {
    activeColumns () {
      return this.trackerColumnsConfig.filter(el => Object.keys(el).indexOf('toggle') == -1 || el.toggle)
    },
    toggleableColumns () {
      return this.trackerColumnsConfig.filter(el => Object.keys(el).indexOf('toggle') > -1)
    },
    placements () {

      //console.log('...updating computed placements')
      let filteredPlacements = false

      if (this.unfilteredPlacements.length) {

        if (this.textSearch.length > 2) { 

          let searchRegex = new RegExp(this.textSearch.replace(/\(/g, '\\(').replace(/\)/g, '\\)'), 'ig')
          
          console.log(searchRegex)

          
          

          filteredPlacements = this.unfilteredPlacements.filter(el => [
              el.AVTRRT__Contact_Candidate__r.FirstName || '', 
              el.AVTRRT__Contact_Candidate__r.LastName || '',
              el.AVTRRT__Job_Title__c || '', 
              el.Additional_Notes__c || '', 
              el.Coverage__c || '',
              el.Name || ''
            ].join('||').match(searchRegex))
          //filteredPlacements = this.unfilteredPlacements.filter(el => el.searchableText.toLowerCase().indexOf(this.textSearch.toLowerCase()) > -1)
        
            //|| searchRegex.test(el.AVTRRT__Job_Title__c)
            //|| searchRegex.test(el.AVTRRT__Job_Title__c)
            //|| el.AVTRRT__Job_Title__c.toLowerCase().indexOf(this.textSearch.toLowerCase()) > -1
            //|| el.Coverage__c.toLowerCase().indexOf(this.textSearch.toLowerCase()) > -1
            //|| el.Additional_Notes__c.toLowerCase().indexOf(this.textSearch.toLowerCase()) > -1
          //})
        } else filteredPlacements = this.unfilteredPlacements

        
        for (let filter of this.params.filters) {
          let activeFilters = Object.keys(filter.values).filter(key => !!filter.values[key])
          filteredPlacements = filteredPlacements.filter(el => activeFilters.indexOf(el[filter.field] || 'None') > -1)  
        }

        if (this.sortedBy) {
          filteredPlacements.sort((a,b) => {

            let a1 = a.AVTRRT__Contact_Candidate__r.FirstName[0]
            let b1 = b.AVTRRT__Contact_Candidate__r.FirstName[0]

            if (a[this.sortedBy] === b[this.sortedBy]) return  a1 - b1
            else if (a[this.sortedBy] === null) return this.ascending ? -1 : 1
            else if (b[this.sortedBy] === null) return this.ascending ? 1 : -1
            else if (a[this.sortedBy] > b[this.sortedBy]) return this.ascending ? 1 : -1
            else return this.ascending ? -1 : 1
          })
        }
        


      }

      //console.log(filteredPlacements)
      
      return filteredPlacements
    }
  },
  created () {
    this.$bus.$on('refetch', this.$fetch)
    this.$bus.$on('resize', this.resizeStuff)

    this.$axios.defaults.baseURL = this.$bus.servers[process.env.NODE_ENV].tracker
  },
  beforeDestroy () {
    this.$bus.$off('refetch')
  },
  mounted () {
    //this.resizeStuff()
    if (process.client) {
      
      document.querySelector('#placements-table').style.width = `${ this.trackerColumnsConfig.reduce((acc, el) => acc += el.width, 0) }px`

      this.createSocket()

      /*
      this.$refs.placements.addEventListener('scroll', e => {
        console.log('scrolling...', this.$refs.placements.scrollLeft)
        //this.offsetLeft = `translateZ(0) translateX(${ this.$refs.placements.scrollLeft }px)`
        this.offsetLeft = `${ this.$refs.placements.scrollLeft }px`
      })
      */
    }
  },
  methods: {
    
    generateFilters () {
      
      this.params.filters = trackerFiltersConfig.map(el => new filterObj(el.label, el.field))

      for(let filter of this.params.filters) {

        filter.values = {}

        let uniqueFilterValues = this.unfilteredPlacements.reduce((acc, el) => [...acc, el[filter.field] || 'None'], [])
        .filter((el, idx, self) => self.indexOf(el) == idx)
        .sort((a,b) => {
          if (a === null || a === 'None') return 1
          else if (a === null || b === 'None') return -1
          else return a > b ? 1 : -1
        })

        //console.log(uniqueFilterValues)

        for (let val of uniqueFilterValues) {
          switch (filter.field) {
            case 'Internal_Status__c':
              this.$set(filter.values, val, ['Client Cancelled', 'Not Filled'].indexOf(val) == -1) 
              break
            default:
              this.$set(filter.values, val, true)
          }
          
          
        }
      }

      this.$bus.log(this.params.filters, '<< generated filter values')
      

    },
    async loadData () {
      this.loadingData = true
      //console.log(this.$axios.defaults.baseURL)
      //console.log(this.$axios.defaults.headers.common['Authorization'])
      this.$bus.log('loading data...')
      await this.$axios.post(`/tracker/placements/load`, this.params)
      .then(({data}) => {
        //console.log(data)
        let unfilteredPlacements = data.placements.map(el => {

          try {
            el.candidateCompensation = (parseFloat(el.AVTRRT__Pay_Rate__c || 0) + (parseFloat(el.AVTRRT__Contact_Candidate__r.Pay_Rate_Adjustment__c || 0))).toFixed(2)
            el.jobApplicantPayRate = (el.AVTRRT__Job_Applicant__r && parseFloat(el.AVTRRT__Job_Applicant__r.Pay_Rate__c) || 0).toFixed(2)
            
          } catch (e) {
            console.log(e)
          }

          return el
        })

        this.unfilteredPlacements = unfilteredPlacements

        console.log(this.unfilteredPlacements, '<< unfiltered')

        this.$bus.accounts = data.accounts
        this.$bus.users = data.users
        this.$bus.metadata = data.metadata
        try {
          this.generateFilters()
        } catch (e) {
          throw e
        }
      })
      .catch(e => {
        let {message, stack} = e.response && e.response.data || e
        this.$bus.$emit('toaster', {status: 'error', message})
        console.log(stack || 'NO STACK')
      })
      .finally(() => {
        this.loadingData = false
        this.$nextTick(() => this.resizeStuff())
      })
      
    },
    sortBy ($ev) {
      let sortField = $ev.target.dataset.sort || false
      if (!sortField) return
      if (this.sortedBy == sortField) {
        if (this.ascending) this.ascending = false
        else {
          this.sortedBy = false
          this.ascending = true
        }
      }
      else {
        this.sortedBy = sortField
        this.ascending = true
      }
    },
    updateRow (update) {

      if(!this.unfilteredPlacements.length) return

      let current = this.unfilteredPlacements.find(el => el.Id == update.Id)
      current = Object.assign(current, JSON.parse(JSON.stringify(update)))
      this.generateFilters()
      
    },
    async doRowUpdate (update) {
      await this.socket.emitP('updatePlacement', update)
      .then((resp) => {
        this.$bus.log('Update', resp, 'WTF?!')
        //this.updateRow(resp)
        //this.unfilteredPlacements.splice(currentIdx, 1, resp)
      })
      .catch(e => {
        console.log(e.stack)
      })
    },
    insertRow (insert) {

      if(!this.unfilteredPlacements.length) return

      let originalIdx = this.unfilteredPlacements.indexOf(this.unfilteredPlacements.find(el => el.Id == insert.originalId)) + 1

      this.$bus.log(originalIdx, '<< insertion point')

      delete insert.originalId

      this.unfilteredPlacements.splice(originalIdx, 0, insert)
      this.generateFilters()
      
    },
    async doRowInsert (insert) {
      await this.socket.emitP('insertPlacement', insert)
      .then((resp) => {
        this.$bus.log('Extend', resp, 'WTF?!')
        //this.updateRow(resp)
        //this.unfilteredPlacements.splice(currentIdx, 1, resp)
      })
      .catch(e => {
        console.log(e.stack)
      })
    },
    prependRow (prepend) {

      if(!this.unfilteredPlacements.length) return

      try {
        this.unfilteredPlacements.unshift(prepend)
      } catch (e) {
        console.log(e)
      }
      //this.generateFilters()
      
    },
    async doRowPrepend (prepend) {
      await this.socket.emitP('prependPlacement', prepend)
      .then((resp) => {
        this.$bus.log('Create', resp, 'WTF?!')
        //this.updateRow(resp)
        //this.unfilteredPlacements.splice(currentIdx, 1, resp)
      })
      .catch(e => {
        console.log(e.stack)
      })
    },
    createSocket () {

      if (!process.client) return 

      this.socket = this.$nuxtSocket({
        name: 'starla-staff',
        channel: '/tracker',
        transports: ['websocket'],
        path: '/ws/'
      })
      
      this.socket.on('placementDeclined', ({declinedPlacement, replacementOrder}) => {

        this.$bus.log('Received PLACEMENT DECLINED emission!', declinedPlacement)

        this.updateRow(declinedPlacement)
        this.prependRow(replacementOrder)
      })
      
      this.socket.on('updatePlacement', update => {
        this.$bus.log('Received UPDATE emission!', update)
        this.updateRow(update)
      })
      this.socket.on('insertPlacement', insert => {
        this.$bus.log('Received EXTEND emission!', insert)
        this.insertRow(insert)
      })
      this.socket.on('prependPlacement', prepend => {
        this.$bus.log('Received ADD emission!', prepend)
        this.prependRow(prepend)
      })
      this.socket.on('disconnect', reason => {
        this.$bus.log('Disconnected?', reason)

        this.tryToReconnect()
        
      })
    },
    tryToReconnect () {
      this.reconnectInterval = setInterval(() => {
        try {
          this.createSocket()
          clearInterval(this.reconnectInterval)
        } catch (e) {
          console.log(e)
        }
      }, 1000)
    },
    toggleRow (placement) {
      if (this.activatedPlacement == placement) this.activatedPlacement = false
      else this.activatedPlacement = placement
    },
    assignStaffer (openOrder) {
      this.overlayPlacement = openOrder
      this.overlayMode = 'assign-staffer'  
    },
    hireStaffer (openOrder) {
      this.overlayPlacement = openOrder
      this.overlayMode = 'hire-staffer'  
    },
    async removeStaffer (placement) {
      if (confirm('Are you sure you want to remove staffer and re-open this order?')) {

        await this.$axios.post('/tracker/order/reopen', placement)
        .then(({data}) => {
          this.doRowUpdate(data)
        })
        .catch(e => {
          let {message, stack} = e.response.data
          this.$bus.$emit('toaster',{status: 'error', message})
          console.log(stack)
        })
      }
    },
    addPlacement () {
      this.overlayPlacement = false
      this.overlayMode = 'add-placement'  
    },
    extendPlacement (extendingPlacement) {
      this.overlayPlacement = extendingPlacement
      this.overlayMode = 'extend-placement'
    },
    updatePlacement (updatingPlacement) {
      this.overlayPlacement = updatingPlacement
      this.overlayMode = 'update-placement'
    },
    cancelOverlay () {
      this.overlayMode = false
      this.overlayPlacement = false
    },
    resizeStuff () {
      if (!process.client) return

      if (!this.placements.length) return setTimeout(() => this.resizeStuff(), 500)
      this.$bus.log('Resizing UI')
      let placementsSection = document.getElementById('placements')
      let placementsTable = document.getElementById('placements-table')

      //console.log(placementsSection)

      let scrollingHeight = window.innerHeight - placementsSection.getBoundingClientRect().top
      this.tableWidth = `${ Math.min(placementsSection.getBoundingClientRect().width, placementsTable.getBoundingClientRect().width)}px`
      placementsSection.style.height = `${scrollingHeight}px`
    }
  },
  watch: {
    showFilters () {this.$nextTick(() => this.resizeStuff())},
    showColumns () {this.$nextTick(() => this.resizeStuff())},
    '$bus.fullscreen' (val) {
      if (val) {
        this.showFilters = false
        this.showColumns = false
      } else {
        this.showFilters = true
        this.showColumns = true
      }
    }
  }
}
</script>

<style lang="scss">


.main-content {
  //max-width: 1900px;
  margin: auto;
}

button {
  border: none;
  border-radius: 5px;
  background: #f99d1c;
  height: auto;
  padding: 4px 10px;
  color: white;
  cursor: pointer;
  &:hover {
    background: #db8000;
  }
}

#date-range-new-order {
  display: grid;
  grid-template-columns: auto max-content max-content;
  grid-gap: 20px;
  align-items: center;
  input[type=text] {
    width: 100px;
  }
}

.loading-container {
  
  display: flex;
  height: 60px;
  display: flex;
  align-items: center;
  text-align: center;
}

.search-bar {
  display: grid;

  &.tracker{
    grid-template-columns: auto max-content max-content;
  }
  &.timecards{
    grid-template-columns: auto max-content;
  }

  grid-gap: 20px;

  .search-field-container {
    width: 100%;
    max-width: 300px;
    .search-field {
      padding-right: 25px;
      width: 100%;
    }
    position: relative;
    &:after{
      display: block;
      content: '';
      height: 80%;
      width: 23px;
      background-image: url('data:image/svg+xml;utf8,<svg id="Layer_2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200.64 198.77"><path class="cls-1" d="M153.88,76.94C153.88,34.45,119.43,0,76.94,0S0,34.45,0,76.94s34.45,76.94,76.94,76.94,76.94-34.45,76.94-76.94Zm-76.94,52.19c-28.83,0-52.19-23.37-52.19-52.19S48.12,24.75,76.94,24.75s52.19,23.37,52.19,52.19-23.37,52.19-52.19,52.19Z"/><rect class="cls-1" x="148.01" y="129.33" width="33.76" height="67.36" transform="translate(-66.97 164.34) rotate(-45)"/></svg>');
      background-repeat: no-repeat;
      background-size: auto 80%;
      background-position: calc(100% - 5px);
      position: absolute;
      right: 2px; top: 10%;
      opacity: 0.5;
    }


  }
}

.max-min-label{
  height: 20px;
  display: flex;
  align-items: center;
}

#date-range-new-order, #filters, .search-bar, #toggleable-columns {
  font-size: .8rem;
  padding: 10px;
  background: #eee;
  margin-bottom: 8px;
}



#status-bar-container {
  height: 20px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: stretch;
  width: 100%;
  #status-bar {
    width: 100%;
    display: grid;
    grid-template-columns: max-content auto;
    grid-template-rows: 40px;
    align-items: center;
    font-size: .8rem;
    > :last-child {
      text-align: right;
    }
  }
  
}

#placements {
  width: calc(100% + 20px);
  margin-left: -10px;
  margin-right: 0;
  
  > ul {
    display: block;
    list-style: none;
    margin: 0;
    padding: 0;
    width: calc(100% - 40px);
    > li{
      &.active{
        margin: 20px 0;
      }
      width: auto;
    }
  }

  &.disabled {
    pointer-events: none;
    opacity: .5;
  }

  #placements-table {
    display: table;
    table-layout: fixed;
    position: relative;
    border: none;
    border-collapse:separate; 
    border-spacing: 0 1px;
    margin-bottom: 50px;



    thead {
      position: sticky;
      top: 0;
      background: #ccc;
      z-index: 1;

      > tr{
        background: #ccc;
         > th {
          text-align: left;
          font-weight: normal;
          font-size: .7rem;  
          padding: 5px 5px;
          position: relative;
          &.sortable {
            cursor: pointer;
            &:hover {
              background: #ddd;  
            }
          }
          &.sorted {
            font-weight: bold;
            background: #eee;
          }
         }
      }
    }

    tbody {
      overflow-y: scroll;
      font-size: .8rem;
    }
  }

  overflow: hidden;

  &:hover {
    overflow: scroll scroll;
  }

}





.column-toggle {
  display: inline-block;
  margin: 0 7px;
  font-size: 9px;
  color: #aaa;
  cursor: pointer;
  &.active,
  &:hover {
    color: black;
  }
}



#tracker-header{
  display: grid;
  width: 100%;
  grid-template-columns: auto max-content;
  align-items: center;
}
</style>
