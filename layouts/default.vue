<template>
  <div v-show="loggedin">
    <LoggingOut v-if="loggingout" />
    <ToolTip />
    <Toaster />
    <header v-show="!$bus.fullscreen">
      
      <div>
        <StarlaLogo width="250px" />
      </div>
      
      <div style="display: flex; align-items: center;">
        <a style="display: inline-block;white-space: nowrap;align-self: center;" @click="logout" tool-tip="Click here to logout">Logout {{$store.state.firstname}}</a>
      </div>

      <div id="nav-container" v-show="accessToken">
        <MainNavigation />
      </div>

    </header>
    <nuxt v-cloak />
  </div>
</template>

<script>
import LoggingOut from '~/components/ui/LoggingOut'
import StarlaLogo from '~/components/StarlaLogo'
import Toaster from '~/components/ui/Toaster'
import MainNavigation from '~/components/MainNavigation'
import ToolTip from '~/components/ui/ToolTip'
import { mapGetters } from 'vuex'

export default {
  components: {
    StarlaLogo, 
    Toaster,
    MainNavigation,
    LoggingOut,
    ToolTip
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
    this.$axios.defaults.headers.common['X-Requestor-Email'] = `${this.$store.state.email}`

    return await this.$axios.get(`/auth/check-token`)
    .then(({data}) => data || this.$router.push('/login?expired'))
    .catch(() => this.$router.push('/login?invalid'))
    //console.log(this.$axios.defaults.headers.common['Authorization'])

    

  },
  
  mounted () {

    this.$router.afterEach((to, from) => {
      //console.log(to, from)

      this.$bus.activateToolTips()
    })

    this.$router.beforeResolve((to, from, next) => {
      //console.log(to, from)

      this.$bus.deactivateToolTips()
      
      next()
      
    })

    this.$bus.activateToolTips()

    //console.log(this.$store.state.accessToken, '<< accessToken')
    //alert(JSON.stringify(this.$axios.defaults.headers))

  },
  methods: {
    
    logout () {
      this.loggingout = true
      this.$nextTick(() => {
        this.$store.commit('LOGOUT')
        delete this.$axios.defaults.headers.common['Authorization']
        location.href = '/'
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
  grid-template-columns: auto min-content;
  align-content: center;
  

  > div {
    
    
    padding: 10px 20px;

    

    &#nav-container {
      grid-column: 1/3;
    }
  }

  
}

a {
  cursor: pointer;

  color: #61cae6;
  &:hover {
    color: darken(#61cae6, 25%);
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

[tool-tip] > * {
  pointer-events: none;
}
</style>
