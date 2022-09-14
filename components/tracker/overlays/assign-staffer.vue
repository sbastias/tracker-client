<template>
  <div>

    <div class="overlay-heading">
      <h3>Assign Existing Staffer</h3>
    </div>

    <div v-if="loadingStaffers">
      <LoadingGraphic message="Loading Staffers..." />
    </div>

    <div class="form" v-else>

      <div class="form-row">
        
        <div class="form-cell">
         
          <label>Select Staffer</label>
          <select v-model="stafferId" @change="getJobApplicantRecords">
            <option v-for="(staffer, idx) in staffers" :key="`staffer-${idx}`" :value="staffer.Id">
              {{staffer.FirstName}} {{staffer.LastName}}
            </option>
          </select>
        </div>

        <div class="form-cell">
         
          <label>Select Job Applicant No.</label>
          <select v-model="jobApplicantId">
            <option v-for="(applicant, idx) in jobApplicants" :key="`applicant-${idx}`" :value="applicant.Id">
              {{applicant.Name}} {{applicant.AVTRRT__Account_Job__r.Shortcode__c}} {{applicant.AVTRRT__Job_Title__c}}
            </option>
          </select>
        </div>

      </div>

      <div class="form-controls">
        <button @click="assignStaffer" :disabled="!(stafferId && jobApplicantId)">Assign Staffer</button>
      </div>

    </div>
  </div>
</template>

<script>
import LoadingGraphic from '~/components/ui/LoadingGraphic'



export default {
  props: ['original-placement'],
  components: {
    LoadingGraphic
  },
  data () {
    return {
      placement: Object.assign({}, this.originalPlacement),
      loadingStaffers: true,
      stafferId: '',
      jobApplicantId: '',
      staffers: [],
      jobApplicants: []
    }
  },
  created () {

  },
  async fetch () {
    return await this.$axios.get(`/tracker/staffers/load`)
    .then(({data}) => {
      console.log(data)
      this.staffers = data
      this.loadingStaffers = false
    })
    .catch(e => {
      let {message, stack} = e.response.data
      this.$bus.$emit('toaster',{status: 'error', message})
      console.log(stack)
    })
  },
  mounted () {
    this.$bus.log(this.$bus.metadata)
  },
  methods: {
    async getJobApplicantRecords () {
      this.$bus.log('Getting Job Applicant records...')
      if (!this.stafferId) return
      return await this.$axios.post(`/tracker/applicants/load`, {candidateId: this.stafferId})
      .then(({data}) => this.jobApplicants = data)
      .catch(e => {
        let {message, stack} = e.response.data
        this.$bus.$emit('toaster',{status: 'error', message})
        console.log(stack)
      })
    },
    async assignStaffer () {
      //clean up placement extension

      let assign = {Id: this.placement.Id, AVTRRT__Contact_Candidate__c: this.stafferId}

      this.$bus.log(JSON.stringify(assign, null, '\t'))

      await this.$axios.post(`/tracker/order/assign`, assign)
      .then(({data}) => {
        this.$bus.$emit('toaster',{status: 'success', message: 'Existing Staffer assigned to Order!'})
        this.$parent.$emit('update-row', data)
        this.$parent.$emit('cancel-overlay')
        
      })
      .catch(e => {
        let {message, stack} = e.response.data
        this.$bus.$emit('toaster',{status: 'error', message})
        console.log(stack)
      })
      
    }
  },
  watch: {
    
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/forms.scss';
.form {
  margin-top: 20px;
  .form-row:nth-child(1){grid-template-columns: 100%;}
}
</style>

