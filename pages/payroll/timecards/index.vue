<template>
  <div>
    <b>Select Company and Weekending to manage Timecards, Quickbooks Time Entry Imports and Invoicing</b>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  props: ['data-rows'],
  data () {
    return {
      moment
    }
  }
}
</script>