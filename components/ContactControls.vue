<template>
  <div id="contact-controls">
    <button @click.stop="$parent.$emit('update', contact)">Edit this Contact</button>
  </div>
</template>



<script>
import moment from 'moment'
import Icon from '~/components/ui/Icons'
//import SalesforceIcon from '~/components/ui/SalesforceIcon'


export default {
  props: ['contact'],
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
#contact-controls {
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