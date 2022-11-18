<template>
  <div id="placement-controls">
    <button @click.stop="$parent.$emit('documents', placement)">View Documents</button>
    <template v-if="!$parent.isExternalUser">
      <button @click.stop="$parent.$emit('update', placement)">Edit this Placement</button>
      <button @click.stop="$parent.$emit('extend', placement)">Extend this Placement</button>
      <button @click.stop="$parent.$emit('reopen', placement)">Remove Staffer</button>
    </template>
  </div>
</template>



<script>

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
#placement-controls {
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