<template>
  <div id="console-payroll">
    <div>Payroll Console</div>
    <ul>
      <li v-for="(line, idx) in tally" :key="idx+'line'">
        {{line}}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: ['tally'],
  methods: {
  }
}
</script>

<style lang="scss">

#console-payroll{

  > ul {
    list-style: none;
    display: block;
    padding: 15px;
    margin: 0;
    background: #333;
    color: #aaa;
    height: 100%;
  }
  
  height: 100%;
}
</style>
