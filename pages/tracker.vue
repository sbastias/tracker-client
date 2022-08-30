<template>
  <div class="container">

    <TrackerOverlay :mode="overlayMode" :placement="overlayPlacement" v-if="overlayMode" @cancel-overlay="cancelOverlay" />

    <div class="main-content">

      <h1>Tracker</h1>

      <section id="search-bar">
        <input type="text" v-model="textSearch" />
      </section>

      <section v-if="$fetchState.pending"><Loader message="Loading Placements..." /></section>
      
      <section v-else id="placements">
        <ul>
          <li v-for="(placement, idx) in placements" :key="placement.Id" :id="`placement-${idx}`" :class="{active: activatedPlacementId == placement.Id}">
            <PlacementRow 
              :original-placement="placement"
              :active="activatedPlacementId == placement.Id"
              @activate="activatePlacement" 
              @deactivate="deactivatePlacement"
              @extend="extendPlacement" 
            />
          </li>
        </ul>
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
      overlayPlacement: false
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
  },
  beforeDestroy () {
    this.$bus.$off('refetch')
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
    }
  }
}
</script>

<style lang="scss">
.container {
  
}

.main-content {
  max-width: 1300px;
  margin: auto;
}

#placements {
  padding-left: 10px;
  > ul {
    display: block;
    list-style: none;
    margin: 0;
    padding: 0;
    > li{
      &.active{
        margin: 20px 0;
      }
    }
  }
}

#search-bar {
  padding: 0;
  margin: 20px 0;
}



</style>
