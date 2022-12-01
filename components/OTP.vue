<template>
<div id="otp-overlay">

  <div style="position: absolute; top: -10000px">
    <input v-model="otpData.code" id="digits-input" @input="numOnly" />
  </div>

  <div id="otp-form">

    

    <div>

      <h2 style="margin-bottom: 15px;">We've emailed your passcode!</h2>
      <p>Check your email for the 6-digit code and enter it below to authenticate.</p>

      <div id="otp-digits">
        <div v-for="(digit, idx) in Array(6)" :key="`digit-${idx}`" @click="enterDigits">
          {{otpData.code[idx] || ''}}
        </div>
      </div>

      <div v-show="error" style="font-weight: bold; margin-top: 20px;">
        <div v-if="error == 'WRONG_CODE'">Wrong Passcode! Try again.</div>
      </div>

    </div>

    

  </div>


</div>
</template>

<script>
import Loader from '~/components/ui/Loader.vue'

export default {
  props: ['username'],
  components: {Loader},
  data () {
    return {
      otpData: {
        username: false,
        code: ''
      },
      error: false
    }
  },
  created () {
    this.otpData.username = this.username
  },
  beforeDestroy () {
    this.otpData.username = false
  },
  methods: {
    numOnly () {
      if(!/^\d+$/.test(this.otpData.code)) {
        //console.log('not number')
        this.otpData.code = String(this.otpData.code).substring(0, this.otpData.code.length - 1)
      }
    },
    enterDigits () {
      document.getElementById('digits-input').focus()
    },
    
    async checkOTP () {

      this.doingSomething = true

      await this.$axios.post(`/auth/otp/check`, this.otpData)
      .then(({data}) => {

        console.log(data)
        return this.$emit('confirm-login', data)

      })
      .catch(e => {
        console.log(e)
        console.log(JSON.stringify(e, null, '\t'))
        //alert('Login failed! ' + e.response.data)
        if (e.response.data) this.error = e.response.data
        else alert('OTP Failed!')
      })
      .finally(() => this.doingSomething = false)
    }
  },
  watch: {
    'otpData.code' (val) {
      this.error = false
      if (val.length == 6) return this.checkOTP()
    }
  }
}
</script>

<style lang="scss">
#otp-overlay{
  z-index: 10000;
  position: fixed;
  overflow: hidden;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  backdrop-filter: blur(3px);
  background: rgba(0,0,0,0.1);
}
#otp-form {
  min-height: 100px;
  max-width: 450px;
  background: white;
  border-radius: 4px;
  padding: 30px;
  width: 90%;
  text-align: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  #otp-digits {
    margin-top: 20px;
    display: grid;
    width: 100%;
    grid-template-columns: repeat(6, 1fr);
    grid-gap: 5px;

    > div {

      overflow: hidden;
      border: 1px solid #ccc;
      display: block;
      height: 60px;
      font-size: 30px;
      text-align: center;
      line-height: 60px;
      font-weight: bold;

    }
  }
}



</style>