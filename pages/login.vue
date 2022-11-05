<template>
<div id="login-screen">



  <div id="login-container">
    <div v-if="expired" expired>Session expired. Please login again.</div>
  <Logo orientation="vertical" />
  <h1 id="title">Starla</h1>
  <form>
    <div class="form-row">
      <div class="form-cell">
        <input type="email" v-model="loginData.username" :class="{filled: !!loginData.username}">
        <label for="email">Salesforce User</label>
      </div>
    </div>
    <div class="form-row" style="margin-bottom: 15px;">
      <div class="form-cell">
        <input type="password" v-model="loginData.password" :class="{filled: !!loginData.password}" v-if="masked">
        <input type="text" v-model="loginData.password" :class="{filled: !!loginData.password}" v-else>
        <label for="email">Salesforce Password</label>
        <a id="show-hide" @click="masked = !masked">{{ masked && 'Show' || 'Hide'}} Password</a>
      </div>
    </div>
    <div class="form-row">
      <div class="form-cell">
        <button @click.prevent="doLogin" :disabled="loggingIn"><span v-if="loggingIn">Please wait...</span><span v-else>Login!</span></button>
      </div>
    </div>
  </form>
  </div>
</div>
</template>

<script>
import Logo from '~/components/Logo'
export default {
  layout: 'login',
  components: {
    Logo
  },
  data () {
    return {
      loginData: {
        username: '',
        password: ''
      },
      loggingIn: false,
      expired: false,
      masked: true
    }
  },
  created () {
    if (process.client) {

      this.$axios.defaults.baseURL = this.$bus.servers[process.env.NODE_ENV].tracker

      if (location.hostname.indexOf('localhost') > -1) {
        if (!location.search) {
          this.loginData.username = 'serge@yorksearchgroup.com'
          this.loginData.password = 'YORK1232020@@@'
        } else if (location.search.match(/drew/)) {
          this.loginData.username = 'drew.blais@baffinland.com'
          this.loginData.password = 'testpass'
        }
      }

      if (location.search.substring(1) == 'expired') this.expired = true
    }
  },
  methods: {
    async doLogin () {
      this.loggingIn = true
      return await this.$axios.post('/login', this.loginData)
      .then(({data}) => {
        //console.log(data)
        this.$store.commit('STORE_TOKEN', data.accessToken)
        this.$store.commit('STORE_EMAIL', this.loginData.username)

        if (data.user) {
          this.$store.commit('STORE_USER', data.user)
          this.$store.commit('STORE_FIRSTNAME', data.user.FirstName)
          this.$store.commit('STORE_PERMISSIONS', data.user.Starla_Permissions__c)
        } else {
          this.$store.commit('STORE_PERMISSIONS', data.Starla_Permissions__c)
          this.$store.commit('STORE_FIRSTNAME', data.FirstName)
        }

        this.$router.push('/')
        console.log(this.$store.state.accessToken, '<< accessToken')
      })
      .catch(e => {
        console.log(e)
        console.log(JSON.stringify(e, null, '\t'))
        alert('Login failed! ' + e.response.data)
      })
      .finally(() => {
        this.loggingIn = false
      })
    }
  }
}
</script>

<style lang="scss">
#login-screen{
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
#login-container {
  max-width: 320px;
  width: 90%;

  #title{
    text-align: center;
    font-size: 1.5rem;
    font-weight: 600;
    color: #811818;
    margin-top: 20px;
  }

  form {
    margin-top: 30px;
    display: grid;
    grid-gap: 20px;
    grid-template-columns: 100%;
    .form-row {
      
      .form-cell{
        position: relative;
        input{
          width: 100%;
          position: relative;
          padding: 20px 8px 10px;
          font-size: 1.1rem;

          + label{
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            width: auto;
            display: flex;
            align-items: center;
            left: 8px;
            transform-origin: 0;
            transition: .3s linear;
            pointer-events: none;
          }

          &.filled,
          &:active,
          &:focus {
            + label {
              transform: translateY(-15px) scale(.7);
              opacity: .7;
            }
          }

        }
      }
      button {
        width: 100%;
        background-color: #811818;
        color: white;
        appearance: none;
        border: none;
        border-radius: 5px;
        padding: 15px;
        font-size: 1rem;
        &:not([disabled]){
          transition: .2s;
        }
        cursor: pointer;
        &:hover {
          background-color: #b50909;
        }
        &[disabled] {
          background-color: #ccc;
          cursor: not-allowed;
        }
      }
    }
  }
}

[expired] {
  text-align: center;
  color: #cc0000;
  margin-bottom: 15px;
}

#show-hide {
  position: absolute;
  bottom: -15px;
  right: 0;
  font-size: .8rem;
}
</style>