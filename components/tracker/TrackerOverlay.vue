<template>

  <div class="overlay-container">

    <div class="overlay-bg"></div>

    <div class="overlay-content-container">

      <div class="overlay-content">
        <CancelX @cancel="cancelOverlay" class="overlay-cancel" />
        <component :is='mode' 
          :original-placement="placement" 
          @edited="flagEdited"
        />
      </div>

    </div>
    
    

  </div>

</template>

<script>
import ExtendPlacement from '~/components/tracker/overlays/extend-placement'
import UpdatePlacement from '~/components/tracker/overlays/update-placement'
import AddPlacement from '~/components/tracker/overlays/add-placement'
import CancelX from '~/components/ui/CancelX'
export default {
  props: ['mode','placement'],
  data () {
    return {
      edited: false
    }
  },
  components: {
    ExtendPlacement,
    UpdatePlacement,
    AddPlacement,
    CancelX
  },
  methods: {
    cancelOverlay () {
      if (this.edited && confirm('You have unsaved changes, are you sure you want to cancel?') || !this.edited) {
      
        this.$bus.log('Cancelling overlay')
        this.$emit('cancel-overlay')    
        
      }
    },
    flagEdited (bool) {
      this.$bus.log('Editing detected... changed from original?', bool)
      this.edited = bool
    }
  }
}
</script>

<style lang="scss">
.overlay-container {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  min-height: 100vh;
  width: 100%;
  z-index: 10000;
  overflow: hidden;


  .overlay-bg {
    top: -50%;
    left: -50%;
    position: absolute;
    height: 200%;
    width: 200%;
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(3px);
  }

  .overlay-content-container {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .overlay-content {
      background: white;
      height: auto;
      width: 95%;
      max-height: 750px;
      max-width: 900px;
      min-height: 200px;
      min-width: 600px;
      padding: 30px;
      position: relative;

      .overlay-heading {
        padding-bottom: 20px;
        margin-bottom: 30px;
        border-bottom: 2px solid #ccc;
      }
    }
  }
}

.overlay-cancel{
  position: absolute;
  right: 30px;
  top: 30px;
  height: 20px;
  width: 20px;
  z-index: 2;
}
</style>


