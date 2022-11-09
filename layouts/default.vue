<template>
  <div v-show="loggedin">
    <LoggingOut v-if="loggingout" />
    <Toaster />
    <header v-show="!$bus.fullscreen">
      <div>
        <Logo />
        <h1>Starla</h1>
      </div>
      <div><a @click="logout">Logout {{$store.state.firstname}}</a></div>
      <div id="nav-container" v-show="accessToken">
        <MainNavigation />
      </div>

    </header>
    <nuxt v-cloak />
  </div>
</template>

<script>
import LoggingOut from '~/components/ui/LoggingOut'
import Logo from '~/components/Logo'
import Toaster from '~/components/ui/Toaster'
import MainNavigation from '~/components/MainNavigation'
import { mapGetters } from 'vuex'

export default {
  components: {
    Logo, 
    Toaster,
    MainNavigation,
    LoggingOut
  },
  data (){
    return {
      loggingout: false,
      loggedin: false
    }
  },
  computed: {
    ...mapGetters(['accessToken'])
  },
  async created () {

    //console.log(this.$store.state.accessToken, '<< accessToken')
    //console.log('DEFAULT CREATED')

    if (!this.$store.state.accessToken) return this.$router.push('/login')

    this.loggedin = true

    this.$axios.defaults.headers.common['Authorization'] = `Bearer ${this.$store.state.accessToken}`

    return await this.$axios.get(`/check-token`)
    .then(({data}) => data || this.$router.push('/login?expired'))
    .catch(() => this.$router.push('/login?invalid'))
    //console.log(this.$axios.defaults.headers.common['Authorization'])

  },
  mounted () {

    //console.log(this.$store.state.accessToken, '<< accessToken')
    //alert(JSON.stringify(this.$axios.defaults.headers))

  },
  methods: {
    logout () {
      this.loggingout = true
      this.$nextTick(() => {
        this.$store.commit('LOGOUT')
        delete this.$axios.defaults.headers.common['Authorization']
        return this.$nextTick(() => location.reload())
      })
    },
  }
}
</script>

<style lang="scss">
@import '../assets/scss/forms.scss';

[v-cloak] {
  display: none;
}
html {
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  @media (max-height: 600px) {
    font-size: 14px;
  }
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}



header {
  display: grid;
  width: 100%;
  background: white;
  grid-template-columns: auto max-content;
  

  > div {
    display: flex;
    align-items: center;
    padding: 10px 20px;

    h1 {

      display: inline-block;
      
      font-weight: 600;
      margin-left: 10px;
      font-size: 1.8rem;
      line-height: 1.3rem;
      vertical-align: middle;
      color: #811818;
    }

    &#nav-container {
      grid-column: 1/3;
    }
  }

  
}

a {
  cursor: pointer;

  &:hover {
    color: #990000;
  }
}

.container {
  padding: 0 20px;

  
  > div > h1 {
    margin: 10px 0;
    font-size: 1.3rem;
  }

}

.inline {display: inline-block}
</style>
