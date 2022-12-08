<template>
<div id="login-screen">

  <OTP :username="loginData.username" v-if="loginData.otp" @confirm-login="confirmLogin" />

  <div id="login-container">
    <div v-show="error" error>
      {{error}}
    </div>

  <Logo orientation="vertical" />
  <h1 id="title">Starla</h1>
  <form>
    <div class="form-row">
      <div class="form-cell">
        <input type="email" v-model="loginData.username" :class="{filled: !!loginData.username}">
        <label for="email">Email Address</label>
      </div>
    </div>
    <div class="form-row" style="margin-bottom: 15px;" v-show="isInternal">
      <div class="form-cell">
        <input type="password" v-model="loginData.password" :class="{filled: !!loginData.password}" v-if="masked">
        <input type="text" v-model="loginData.password" :class="{filled: !!loginData.password}" v-else>
        <label for="email">Salesforce Password</label>
        <a id="show-hide" @click="masked = !masked">{{ masked && 'Show' || 'Hide'}} Password</a>
      </div>
    </div>
    <div class="form-row">
      <div class="form-cell">
        <button v-if="isInternal" @click.prevent="doLogin" :disabled="doingSomething"><span v-if="doingSomething">Please wait...</span><span v-else>Login!</span></button>
        <button v-else @click.prevent="sendOTP" :disabled="doingSomething"><span v-if="doingSomething">Please wait...</span><span v-else>Get One-Time Passcode</span></button>
      </div>
    </div>
  </form>
  </div>
</div>
</template>

<script>
import Logo from '~/components/Logo'
import OTP from '~/components/OTP'


export default {
  layout: 'login',
  components: {
    Logo,
    OTP
  },
  data () {
    return {
      loginData: {
        username: '',
        password: '',
        otp: false
      },
      doingSomething: false,
      error: false,
      masked: true
    }
  },
  computed: {
    isInternal () {
      return this.loginData.username && this.loginData.username.search(/(thebullittgroup|yorksearchgroup|qajaqnorthern)\.com/) > -1
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

      if (location.search.substring(1) == 'expired') this.error = {flag: 'EXPIRED', message: 'Session expired. Please login again.'}
    }
  },
  methods: {
    async sendOTP () {
      this.error = false
      this.doingSomething = true

      await this.$axios.post(`/auth/otp/generate`, this.loginData)
      .then(({data}) => {
        console.log(data)
        this.loginData.otp = true
      })
      .catch(e => {
        console.log(e)
        this.error = e.response.data.message
      })
      .finally(() => this.doingSomething = false)
    },
    async doLogin () {
      this.error = false
      this.doingSomething = true
      return await this.$axios.post('/auth/login', this.loginData)
      .then(({data}) => {
        //console.log(data)
        this.confirmLogin(data)
      })
      .catch(e => {
        console.log(e)
        console.log(JSON.stringify(e, null, '\t'))
        this.error = e.response.data
      })
      .finally(() => this.doingSomething = false)
    },
    confirmLogin (data) {

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

[error] {
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