<template>
  <div class="container">

    <TrackerOverlay 
      v-if="overlayMode"
      :mode="overlayMode" 
      :placement="overlayPlacement"  
      @cancel-overlay="cancelOverlay"
      @update-row="doRowUpdate"
    />

    <div class="main-content">

      <h1>Tracker</h1>

      <div v-if="Object.keys(emitErrors).length">{{emitErrors}}</div>

      <client-only>
      <section id="date-range">
        <div>
          Starting on or after <Datepicker class="inline" v-model="params.startAfter" name="start-after" format="yyyy-MM-dd" :use-utc="true" />
          Ending on or before <Datepicker class="inline" v-model="params.endBefore" name="end-before" format="yyyy-MM-dd" :use-utc="true" />
          <button @click="loadPlacements">Load Placements</button>
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
        <input type="text" v-model="textSearch" />
      </section>

      <div id="status-bar-container">
        <div id="loading-container" v-if="loadingPlacements"><Loader message="Loading Placements..." /></div>
        <div id="status-bar" v-else-if="!!placements.length">
          <div>Found {{placements.length}} placements</div>
        </div>
      </div>

      <section id="placements" :class="{disabled: loadingPlacements}">

        <table id="placements-table" v-show="placements.length" cellspacing="0">
          <thead>
            <tr>
              <th @click="sortBy" :data-sort="col.sort" v-for="(col, idx) in trackerColumns" :class="{sortable: !!col.sort, sorted: sortedBy == col.sort}" :key="`col-${idx}`" :style="{width: col.width + 'px'}">{{col.label}}</th>
            </tr>
          </thead>
          <tbody>
            <PlacementRow 
              v-for="(placement, idx) in placements" 
              :key="placement.Id" :id="`placement-${idx}`"
              :placement="placement"
              :active="activatedPlacement == placement"
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
import trackerColumns from '~/config/tracker-columns'
import trackerFilters from '~/config/tracker-filters'
import moment from 'moment'

class paramsObj  {
  constructor () {

    this.startAfter = ((date) => {
      date.setDate(date.getDate() - 30)
      return date
    })(new Date())

    this.endBefore = ((date) => {
      date.setDate(date.getDate() + 30)
      return date
    })(new Date())

    this.filters = {}
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
    Loader
  },
  data () {
    return {
      trackerColumns,
      params: new paramsObj(),
      metadata: false,
      unfilteredPlacements: [],
      textSearch: '',
      activatedPlacement: false,
      moment,
      overlayMode: false,
      overlayPlacement: false,
      loadingPlacements: false,
      sortedBy: false,
      ascending: true,
      emitErrors: {}
    }
  },
  computed: {
    placements () {

      //console.log('...updating computed placements')
      let filteredPlacements = false

      if (this.unfilteredPlacements.length) {

        filteredPlacements = this.unfilteredPlacements 

        if (this.textSearch.length > 2) { 

          let searchRegex = new RegExp(this.textSearch, 'ig')
          console.log(searchRegex)

          filteredPlacements = this.unfilteredPlacements.filter(el => searchRegex.test(el.Candidate.Name + el.AVTRRT__Job_Title__c + el.Additional_Notes__c + el.Coverage__c))
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

        console.log(uniqueFilterValues)

        for (let val of uniqueFilterValues) this.$set(filter.values, val, true)
      }

      console.log(this.params.filters, '<< generated filter values')
      

    },
    async loadPlacements () {
      this.loadingPlacements = true
      //console.log(this.$axios.defaults.baseURL)
      //console.log(this.$axios.defaults.headers.common['Authorization'])
      console.log('loading placements...')
      await this.$axios.post(`/tracker/load`, this.params)
      .then(({data}) => {
        //console.log(data)
        this.unfilteredPlacements = data.placements
        this.$bus.metadata = data.metadata
        try {
          this.generateFilters()
        } catch (e) {
          console.log(e)
        }
      })
      .catch(e => {
        let {message, stack} = e.response.data || e
        this.$bus.$emit('toaster', {status: 'error', message})
        console.log(stack || 'NO STACK')
      })
      .finally(() => {
        this.loadingPlacements = false
        this.$nextTick(() => this.resizeStuff())
      })
      
    },
    sortBy ($ev) {
      let sortField = $ev.target.dataset.sort || false
      if (!sortField) return
      if (this.sortedBy == sortField) this.ascending = !this.ascending
      else this.sortedBy = sortField
    },
    updateRow (update) {

      let current = this.unfilteredPlacements.find(el => el.Id == update.Id)
      let currentIdx = this.unfilteredPlacements.indexOf(current)
      let updated = Object.assign(current, JSON.parse(JSON.stringify(update)))
      console.log(updated)
      this.unfilteredPlacements.splice(currentIdx, 1, updated)
      
    },
    async doRowUpdate (update) {
      await this.socket.emitP('updatePlacement', update)
      .then((resp) => {
        console.log('Update', resp, 'WTF?!')
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
        console.log('Received emission!', update)
        this.updateRow(update)
      })
    },
    activatePlacement (placement) {
      if (this.activatedPlacement == placement) return
      console.log('activating', placement)
      this.activatedPlacement = placement
    },
    deactivatePlacement () {
      console.log('deactivating')
      this.activatedPlacement = false
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
      console.log('Resizing UI')
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
}

#date-range, #filters, #search-bar {
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
          &.sortable {
            cursor: pointer;
          }
          &.sorted {
            font-weight: bold;
            background: #bbb;
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

</style>
