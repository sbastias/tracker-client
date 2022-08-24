<template>
  <div class="container">

    <h1>Tracker</h1>

    <section id="search-bar">
      <input type="text" v-model="textSearch" />
    </section>
    
    <section id="placements">
      <ul>
        <li v-for="(placement, idx) in placements" :key="placement.Id" :id="`placement-${idx}`" :class="{active: placement.active}">
          <PlacementRow 
            :placement="placement"
            :class="{active: placement.active}"
            @activate="activatePlacement" 
            @deactivate="deactivatePlacement"
            @update="updatePlacement" 
            @extend="extendPlacement" 
          />
        </li>
      </ul>
    </section>

  </div>
</template>

<script>
import PlacementRow from '~/components/PlacementRow'
import moment from 'moment'

export default {
  components: {
    PlacementRow
  },
  data () {
    return {
      unfiltererdPlacements: false,
      textSearch: '',
      activatePlacementId: false,
      moment
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
    
  },
  fetchOnServer: false,
  async fetch () {
    //console.log(this.$axios.defaults.baseURL)
    //console.log(this.$axios.defaults.headers.common['Authorization'])
    await this.$axios.get(`/tracker/load/2022/08`)
    .then(({data}) => {
      console.log(data)
      for (let p of data) {
        this.$set(p,'active', false)
      }
      this.unfiltererdPlacements = data
    })
    .catch(({response, message}) => {
      console.log(response && response.data || message)
    })
  },
  methods: {
    activatePlacement (id) {
      if (this.activatedPlacementId == id) return
      console.log('activating', id)
      if (this.activatedPlacementId) this.unfiltererdPlacements.find(el => el.Id == this.activatedPlacementId).active = false
      this.unfiltererdPlacements.find(el => el.Id == id).active = true
      this.activatedPlacementId = id

    },
    deactivatePlacement (id) {
      this.unfiltererdPlacements.find(el => el.Id == id).active = false
      this.activatedPlacementId = false
    },
    updatePlacement (updatedPlacement) {
      console.log(updatedPlacement)
    },
    extendPlacement (extendingPlacement) {
      console.log('extending...')
    },
  }
}
</script>

<style lang="scss">
.container {
  
}

#placements {
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
  padding: 10px 10px;
}

</style>
