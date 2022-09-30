<template>
  <div>
    <b>Found {{ dataRows.length }} active placements for {{ $parent.supplier }} between {{ moment.utc($parent.startDate).format('YYYY-MM-DD') }} and {{ moment.utc($parent.endDate).format('YYYY-MM-DD') }} </b>
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