<template>
  <div id="status-bar-import">
    <div class="working" v-if="status.working">
      <span>Working... Please wait...</span><div class="loader"></div>
    </div>
    <div class="success" v-else-if="status.success">
      <span>{{status.success}}</span>
    </div>
    <div class="error" v-else-if="status.error">
      <span>{{status.error}}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: ['status'],
  methods: {
  }
}
</script>

<style lang="scss">

#status-bar-import{
  position: relative;
  height: auto;
  width: 100%;
  
  > div {
    text-align: center;
    line-height: 20px;
    padding: 10px 0;
    width: 100%;
    vertical-align: middle;

    color: #666;
    border: none;
    border-color: #666;
    background: #eee;

    &.working {
      color: #753802;
      border: none;
      border-color: #753802;
      background: rgb(253, 224, 145);
    }

    &.success {
      color: #015920;
      border: none;
      border-color: #027543;
      background: rgb(208, 255, 184);
    }

    &.error {
      color: #750202;
      border: none;
      border-color: #750202;
      background: rgb(255, 222, 222);
    }
  

    > span {
      line-height: inherit;
      display: inline-block;
      vertical-align: middle;
    }

    .loader {
      display: inline-block;
      height: 20px;
      width: 20px;
      margin: 0 10px;
      background: none;
      position: relative;
      vertical-align: middle;
      line-height: 20px;
      
      &:before {
        content: '';
        display: block;
        border-radius: 50%;
        border: 2px solid #753802;
        border-right-color: transparent;
        position: absolute;
        top: 0;
        left: 0;
        height: 20px;
        width: 20px;
        animation: loaderSpin .5s linear infinite;
      }
    }

  }
}


@keyframes loaderSpin {
  from {
    transform: rotate(0deg);
  } to {
    transform: rotate(360deg);
  }
}

</style>
