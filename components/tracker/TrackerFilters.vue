<template>

  <section id="filters" v-if="maximized">

    <div id="filters-flex" v-if="maximized">
        
      <div v-for="(filter, idx) in filters" :key="`filter-${idx}`">
        <h5>{{filter.label}}</h5>

        <a @click="filter.deselectAll()" v-if="filter.allSelected()">Deselect All</a>
        <a @click="filter.selectAll()" v-else>Select All</a>
        
        <div class="scrollable-filters">
          <label v-for="(value, key, idx2) in filter.values" :key="`filter-${idx}-val-${idx2}`"><input type="checkbox" :value="true" v-model="filter.values[key]"> {{key || 'None'}}</label>
        </div>
      </div>

    </div>

  </section>

</template>

<script>
export default {
  props: ['filters'],
  data () {
    return {
      maximized: true
    }
  },
  components: {
    
  },
  methods: {
    
  },
  watch: {
    maximized (val) {
      this.$nextTick(() => this.$bus.$emit('resize'))
    }
  }
}
</script>

<style lang="scss">
#filters {
  width: 100%;

  #filters-flex {
    width: 100%;
    display: flex;
    flex-direction: row;
    margin-top: 10px;
    background: #eee;
    padding-bottom: 5px;

    
    > div {
      flex: 1;
      overflow: hidden;
      margin-right: 5px;
      h5 {
        font-size: .6rem;
      }
      a{
        font-size: .5rem;
        color: blue;
        display: inline-block;
        margin-bottom: 5px;
      }
      label {
        font-size: .5rem;
        display: block;
        white-space: nowrap;
        margin-bottom: 2px;
      }
      input[type=checkbox] {
        height: 8px;
        width: 8px;
      }
      .scrollable-filters {
        height: 60px;
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
}
</style>


