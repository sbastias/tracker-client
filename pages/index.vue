<template>
  <div class="container">
    <div v-if="!externalUser">
      <h1 >Welcome to Starla!</h1>
    </div>
    <ExternalUserWelcome v-else :user="externalUser" />
  </div>
</template>

<script>
import ExternalUserWelcome from '~/components/external-user/Welcome'
import Loader from '~/components/ui/Loader'
import {mapGetters} from 'vuex'

export default {
  components: {
    Loader,
    ExternalUserWelcome
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
