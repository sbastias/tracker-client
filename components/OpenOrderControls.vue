<template>
  <div id="open-order-controls">
    <button @click.stop="$parent.$emit('assign', placement)">Assign Existing Staffer</button>
    <button @click.stop="$parent.$emit('hire', placement)">Assign NEW Hire</button>
    <button @click.stop="$parent.$emit('deactivate', placement)">Close</button>
  </div>
</template>



<script>
import moment from 'moment'
import Icon from '~/components/ui/Icons'
//import SalesforceIcon from '~/components/ui/SalesforceIcon'


export default {
  props: ['placement'],
  components: {
   
  },
  data () {
    return {
      
    }
  },
  created () {
    
  },
  computed: {
    
  },
  methods: {
    
  },
  watch: {
    
  }
}
</script>

<style lang="scss">
#open-order-controls {
  position: relative;
  height: 100%;
  width: 100%;
  text-align: center;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  button {
    appearance: none;
    display: inline-flex;
    align-items: center;
    border: none;
    height: 40px;
    width: auto;
    padding: 0 20px;
    margin: 0 10px;
    border-radius: 10px;
    cursor: pointer;

    
    
    background: #888;
    color: white;

    &:hover{
      background: #aaa;
    }
  
  }

}


</style>