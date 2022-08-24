<template>
  <div>
    <header>
      <div>
        <Logo />
        <h1>Placement Manager</h1>
      </div>
      <div><a @click="logout">Logout</a></div>
      <nav>
        <ul>
          <n-link custom to="/tracker" v-slot="{navigate}">
            <li @click="navigate">Tracker</li>
          </n-link>
        </ul>
      </nav>
    </header>
    <nuxt />
  </div>
</template>

<script>
import Logo from '~/components/Logo.vue'

export default {
  components: {Logo},
  created () {

    //console.log(this.$store.state.accessToken, '<< accessToken')

    if (!this.$store.state.accessToken) this.$router.push('/login')
    this.$axios.defaults.headers.common['Authorization'] = `Bearer ${this.$store.state.accessToken}`
    //console.log(this.$axios.defaults.headers.common['Authorization'])

  },
  mounted () {

    //console.log(this.$store.state.accessToken, '<< accessToken')
    //alert(JSON.stringify(this.$axios.defaults.headers))

  },
  methods: {
    logout () {
      this.$store.commit('LOGOUT')
      delete this.$axios.defaults.headers.common['Authorization']
      location.reload()
    },
  }
}
</script>

<style lang="scss">
html {
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
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
  align-items: center;
  grid-template-columns: auto min-content;

  nav {
    
    grid-column: 1/3;
    background: #eee;
    width: 100%;
    padding: 0 20px;
    ul {
      display: block;
      list-style: none;
      margin: 0;
      padding: 0;
      li{
        display: inline-block;
        padding: 10px 20px;
        background: rgba(#900000, 0);
        transition: .2s;
        &:hover {
          background: #990000;
          color: white;
          cursor: pointer;
        }
      }
    }
  }

  h1 {
    display: inline-block;
    font-weight: 200;
    margin-left: 10px;
    font-size: 1.6rem;
  }

  > div {
    display: flex;
    align-content: center;
    padding: 10px 20px;
  }
}

a {
  cursor: pointer;

  &:hover {
    color: #990000;
  }
}

.container {
  padding: 20px;
}
</style>
