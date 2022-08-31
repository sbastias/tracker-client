<template>
  <div class="container">

    <TrackerOverlay :mode="overlayMode" :placement="overlayPlacement" v-if="overlayMode" @cancel-overlay="cancelOverlay" />

    <div class="main-content">

      <h1>Tracker</h1>

      <section id="search-bar">
        <input type="text" v-model="textSearch" />
      </section>

      
      
      <section id="placements">

        <div v-if="$fetchState.pending" style="margin-left: 20px;"><Loader message="Loading Placements..." /></div>

        <table id="placements-table" v-show="placements.length" cellspacing="0">
          <thead>
            <tr>
              <th v-for="(col, idx) in columns" :key="`col-${idx}`" :style="{width: col.width + 'px'}">{{col.label}}</th>
            </tr>
          </thead>
          <tbody>
            <PlacementRow 
              v-for="(placement, idx) in placements" 
              :key="placement.Id" :id="`placement-${idx}`"
              :original-placement="placement"
              :active="activatedPlacementId == placement.Id"
              @activate="activatePlacement" 
              @deactivate="deactivatePlacement"
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
import TrackerOverlay from '~/components/TrackerOverlay'
import Loader from '~/components/ui/LoadingGraphic'
import moment from 'moment'

export default {
  head: {
    title: 'Tracker'
  },
  components: {
    PlacementRow,
    TrackerOverlay,
    Loader
  },
  data () {
    return {
      metadata: false,
      unfiltererdPlacements: false,
      textSearch: '',
      activatedPlacementId: false,
      moment,
      overlayMode: false,
      overlayPlacement: false,
      columns: [
        {
          label: '',
          width: 35
        },
        {
          label: '',
          width: 35
        },
        {
          label: 'Candidate Name',
          width: 150
        },
        {
          label: 'Job Title',
          width: 150
        },
        {
          label: 'Department',
          width: 150
        },
        {
          label: 'Crew',
          width: 40
        },
        {
          label: 'Shift',
          width: 40
        },
        {
          label: 'Inbound',
          width: 80
        },
        {
          label: 'Outbound',
          width: 80
        },
        {
          label: 'Location',
          width: 100
        },
        {
          label: 'Flight',
          width: 140
        },
        {
          label: 'Notes',
          width: 140
        },
        {
          label: 'Coverage',
          width: 140
        },
        {
          label: 'Airport',
          width: 80
        },
        {
          label: 'PO #',
          width: 90
        },
        {
          label: 'Supplier',
          width: 50
        },
        {
          label: 'Deployment',
          width: 170
        },
        
      ]
    }
  },
  computed: {
    placements () {

      if (!this.unfiltererdPlacements) return false

      else if (this.textSearch == '') return this.unfiltererdPlacements

      else return this.unfiltererdPlacements.filter(el => el.Candidate.Name.toLowerCase().indexOf(this.textSearch.toLowerCase()) > -1)
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
      document.querySelector('#placements-table').style.width = `${ this.columns.reduce((acc, el) => acc += el.width, 0) }px`
    }
  },
  fetchOnServer: false,
  async fetch () {
    //console.log(this.$axios.defaults.baseURL)
    //console.log(this.$axios.defaults.headers.common['Authorization'])
    console.log('Fetching placements...')
    await this.$axios.get(`/tracker/load/2022/08`)
    .then(({data}) => {
      //console.log(data)
      this.unfiltererdPlacements = data.placements
      this.$bus.metadata = data.metadata
      this.resizeStuff()
    })
    .catch(e => {
      let {message, stack} = e.response.data
      this.$bus.$emit('toaster', {status: 'error', message})
      console.log(stack)
    })
    
  },
  methods: {
    activatePlacement (id) {
      if (this.activatedPlacementId == id) return
      console.log('activating', id)
      //if (this.activatedPlacementId) this.unfiltererdPlacements.find(el => el.Id == this.activatedPlacementId).active = false
      //this.unfiltererdPlacements.find(el => el.Id == id).active = true
      this.activatedPlacementId = id

    },
    deactivatePlacement () {
      this.activatedPlacementId = false
    },
    updatePlacement (updatedPlacement) {
      console.log(updatedPlacement)

    },
    extendPlacement (extendingPlacement) {
      this.overlayPlacement = extendingPlacement
      this.overlayMode = 'extend-placement'
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
  max-width: 1600px;
  margin: auto;
}

#placements {
  width: calc(100% + 40px);
  margin-left: -20px;
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

  #placements-table {
    display: table;
    table-layout: fixed;
    position: relative;
    border: none;


    thead {
      position: sticky;
      top: 0;
      background: #ccc;

      > tr{
        background: #ccc;
         > th {
          text-align: left;
          font-weight: normal;
          font-size: .7rem;  
         }
      }
    }

    tbody {
      overflow-y: scroll;

      font-size: .8rem;

      td {
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: .9em;
        vertical-align: middle;
      }
    }
  }

  overflow: scroll scroll;

}

#search-bar {
  padding: 0;
  margin: 20px 0;
}



</style>
