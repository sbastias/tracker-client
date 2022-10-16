<template>
  <div id="logging-out-screen">
    Logging Out...
  </div>
</template>

<style lang="scss">
#logging-out-screen {
  &:before{
    content: '';
    position: absolute;
    z-index: -1;
    background: #aaa;
    height: 200vh;
    width: 200vw;
    top: -50vh;
    left: -50vw;
  }
  position: fixed;
  top: 0;
  left: 0;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  z-index: 30000;
}
</style>