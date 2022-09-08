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

    <div class="main-content">

      <h1>Tracker</h1>

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
          <button v-show="$bus.accounts" @click="addPlacement">Add New Order</button>
        </div>
      </section>
      </client-only>

      <section id="filters" v-if="!!placements">
        
        <div v-for="(filter, idx) in params.filters" :key="`filter-${idx}`">
          <h5>{{filter.label}}</h5>

          <a @click="filter.deselectAll()" v-if="filter.allSelected()">Deselect All</a>
          <a @click="filter.selectAll()" v-else>Select All</a>
          
          <div class="scrollable-filters">
            <label v-for="(value, key, idx2) in filter.values" :key="`filter-${idx}-val-${idx2}`"><input type="checkbox" :value="true" v-model="filter.values[key]"> {{key || 'None'}}</label>
          </div>
        </div>
      </section>

      <!--div v-if="params.filters.length">{{params.filters.find(el => el.label == 'Supplier')}}</div-->

      <section id="search-bar" v-if="!!placements">
        <div class="search-field-container">
          <input type="text" v-model="textSearch" class="search-field" />
        </div>
      </section>

      <div id="status-bar-container">

        <div id="loading-container" v-if="loadingData"><Loader message="Loading Placements..." /></div>

        <div id="status-bar" v-else-if="!!placements.length">
          <div>Found {{placements.length}} placements</div>
          <div>
            <span v-for="(column, idx) in toggleableColumns" :key="`toggle-col-${idx}`" @click="column.toggle = !column.toggle" class="column-toggle" :class="{active: !!column.toggle}">{{column.label}}</span>
          </div>
        </div>
      </div>

      <section id="placements" :class="{disabled: loadingData}">

        <table id="placements-table" v-show="placements.length" cellspacing="0">
          <thead>
            <tr>
              <th @click="sortBy" :data-sort="col.field" v-for="(col, idx) in activeColumns" :class="{sortable: col.sortable, sorted: sortedBy == col.field}" :key="`col-${idx}`" :style="{width: col.width + 'px'}">
                {{col.label}}
                <Sort v-if="col.sortable" :direction="sortedBy == col.field && (ascending && 'asc' || 'desc')" />
              </th>
            </tr>
          </thead>
          <tbody>
            <PlacementRow 
              v-for="(placement, idx) in placements" 
              :key="placement.Id" :id="`placement-${idx}`"
              :placement="placement"
              :active="activatedPlacement == placement"
              :active-columns="activeColumns"
              @activate="activatePlacement" 
              @deactivate="deactivatePlacement"
              @update="updatePlacement"
              @extend="extendPlacement"
            />
          </tbody>
        </table>

      </section>

    </div>

  </div>
</template>

<script>
import PlacementRow from '~/components/PlacementRow'
import PlacementControls from '~/components/PlacementControls'
import TrackerOverlay from '~/components/tracker/TrackerOverlay'
import Loader from '~/components/ui/LoadingGraphic'
import Sort from '~/components/ui/Sort'
import trackerColumns from '~/config/tracker-columns'
import trackerFilters from '~/config/tracker-filters'
import moment from 'moment'

class rangeObj  {
  constructor () {

    this.fromDate = ((date) => {
      date.setDate(date.getDate() - 7)
      return date
    })(new Date())

    this.toDate = ((date) => {
      date.setDate(date.getDate() + 7)
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
    PlacementRow,
    PlacementControls,
    TrackerOverlay,
    Loader,
    Sort
  },
  data () {
    return {
      trackerColumns,
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
      emitErrors: {}
    }
  },
  computed: {
    activeColumns () {
      return this.trackerColumns.filter(el => Object.keys(el).indexOf('toggle') == -1 || el.toggle)
    },
    toggleableColumns () {
      return this.trackerColumns.filter(el => Object.keys(el).indexOf('toggle') > -1)
    },
    placements () {

      //console.log('...updating computed placements')
      let filteredPlacements = false

      if (this.unfilteredPlacements.length) {

        filteredPlacements = this.unfilteredPlacements 

        if (this.textSearch.length > 2) { 

          let searchRegex = new RegExp(this.textSearch, 'ig')
          console.log(searchRegex)

          

          filteredPlacements = this.unfilteredPlacements.filter(el => {

            let searchableFields = [
              el.AVTRRT__Contact_Candidate__r.FirstName, 
              el.AVTRRT__Contact_Candidate__r.LastName,
              el.AVTRRT__Job_Title__c, 
              el.Additional_Notes__c, 
              el.Coverage__c
            ]

            return searchRegex.test(searchableFields.join('¡'))
          })
        
            //|| searchRegex.test(el.AVTRRT__Job_Title__c)
            //|| searchRegex.test(el.AVTRRT__Job_Title__c)
            //|| el.AVTRRT__Job_Title__c.toLowerCase().indexOf(this.textSearch.toLowerCase()) > -1
            //|| el.Coverage__c.toLowerCase().indexOf(this.textSearch.toLowerCase()) > -1
            //|| el.Additional_Notes__c.toLowerCase().indexOf(this.textSearch.toLowerCase()) > -1
          //})
        }

        for (let filter of this.params.filters) {
          let activeFilters = Object.keys(filter.values).filter(key => !!filter.values[key])
          filteredPlacements = filteredPlacements.filter(el => activeFilters.indexOf(el[filter.field] || 'None') > -1)  
        }

        if (this.sortedBy) {
          filteredPlacements.sort((a,b) => {
            if (a[this.sortedBy] === b[this.sortedBy]) return 0
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
  },
  beforeDestroy () {
    this.$bus.$off('refetch')
  },
  mounted () {
    //this.resizeStuff()
    if (process.client) {
      
      document.querySelector('#placements-table').style.width = `${ this.trackerColumns.reduce((acc, el) => acc += el.width, 0) }px`

      this.createSocket()
    }
  },
  methods: {
    
    generateFilters () {
      
      this.params.filters = trackerFilters.map(el => new filterObj(el.label, el.field))

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

        for (let val of uniqueFilterValues) this.$set(filter.values, val, true)
      }

      this.$bus.log(this.params.filters, '<< generated filter values')
      

    },
    async loadData () {
      this.loadingData = true
      //console.log(this.$axios.defaults.baseURL)
      //console.log(this.$axios.defaults.headers.common['Authorization'])
      this.$bus.log('loading data...')
      await this.$axios.post(`/tracker/load`, this.params)
      .then(({data}) => {
        //console.log(data)
        this.unfilteredPlacements = data.placements
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
      else this.sortedBy = sortField
    },
    updateRow (update) {

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


      this.unfilteredPlacements.unshift(prepend)
      this.generateFilters()
      
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
      this.socket = this.$nuxtSocket({
        name: 'tracker',
        transports: ['websocket'],
        path: '/ws/'
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
    },
    activatePlacement (placement) {
      if (this.activatedPlacement == placement) return
      this.$bus.log('activating', placement)
      this.activatedPlacement = placement
    },
    deactivatePlacement () {
      this.$bus.log('deactivating')
      this.activatedPlacement = false
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
      let placementsSection = document.querySelector('#placements')

      //console.log(placementsSection)

      let scrollingHeight = window.innerHeight - placementsSection.getBoundingClientRect().top
      placementsSection.style.height = `${scrollingHeight}px`
    }
  },
  watch: {
    
  }
}
</script>

<style lang="scss">
.container {
  
}

.main-content {
  //max-width: 1900px;
  margin: auto;

  h1 {
    margin: 20px 0;
  }
}

button {
  border: none;
  border-radius: 5px;
  background: #f99d1c;
  height: 100%;
  padding: 3px 10px;
  color: white;
  cursor: pointer;
  &:hover {
    background: #db8000;
  }
}

#date-range-new-order {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

#date-range-new-order, #filters, #search-bar {
  font-size: .8rem;
  padding: 10px;
  background: #eee;
  margin-bottom: 8px;
}
#filters {
  width: 100%;
  display: flex;
  flex-direction: row;
  
  background: #eee;

  
  > div {
    flex: 1;
    overflow: hidden;
    margin-right: 5px;
    h5 {
      font-size: .6rem;
      margin-bottom: 5px;
    }
    a{
      font-size: .6rem;
      color: blue;
      display: inline-block;
      margin-bottom: 5px;
    }
    label {
      font-size: .6rem;
      display: block;
      white-space: nowrap;
    }
    .scrollable-filters {
      height: 100px;
      width: 100%;
      overflow-y: hidden;
      overflow-x:hidden;
      padding-bottom: 10px;

      &:hover {
        overflow-y: scroll;
      }
    }
  }
}


#status-bar-container {
  height: 40px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: stretch;
  width: 100%;
  #status-bar {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: max-content auto;
    grid-template-rows: 40px;
    align-items: center;

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

  overflow: scroll scroll;

}



.inline {display: inline-block}

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

.search-field-container {
  width: 300px;
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

</style>
