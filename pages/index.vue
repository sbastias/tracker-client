<template>
  <div class="container">
    <div>
      <h1 v-if="!externalUser">Welcome to Starla!</h1>
      <h1 v-else>Welcome to Starla, {{externalUser.FirstName}}!</h1>
    </div>
  </div>
</template>

<script>
import Loader from '~/components/ui/Loader'
import {mapGetters} from 'vuex'

export default {
  components: {
    Loader
  },
  computed: {
    ...mapGetters(['externalUser']),
  }
}
</script>

<style>
.container {
  
}


</style>
