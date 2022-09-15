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

      </div>
      <div class="form-row" v-if="stafferId">

        <div class="form-cell">
         
          <label>Select Job Applicant No.</label>
          <select v-model="jobApplicantId">
            <option v-for="(applicant, idx) in jobApplicants" :key="`applicant-${idx}`" :value="applicant.Id">
              {{applicant.Name}} {{applicant.AVTRRT__Account_Job__r.Shortcode__c}} {{applicant.AVTRRT__Job_Title__c}} - {{applicant.AVTRRT__Stage__c}}
            </option>
          </select>
        </div>


        <div class="form-cell">
          <button @click="newApplicant">Create Applicant Record</button>
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
  props: ['original-placement','is-new'],
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
  computed: {
    jobApplicant () {
      return this.jobApplicants.find(el => el.Id = this.jobApplicantId)
    }
  },
  created () {
    this.$bus.$on('assign-applicant-to-staffer', this.assignApplicantData)
  },
  beforeDestroy () {
    this.$bus.$off('assign-applicant-to-staffer')
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
      if (!this.stafferId) return console.log('NO STAFFER')
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

      let assign = {
        Id: this.placement.Id, 
        AVTRRT__Contact_Candidate__c: this.stafferId,
        AVTRRT__Job_Applicant__c: this.jobApplicantId,
        AVTRRT__Job__c: this.jobApplicant.AVTRRT__Job__c,
        AVTRRT__Hiring_Manager__c: this.jobApplicant.AVTRRT__Hiring_Manager__c,
        Compensation__c: this.jobApplicant.AVTRRT__Hiring_Manager__c
      }

      this.$bus.log(JSON.stringify(assign, null, '\t'))


      await this.$axios.post(`/tracker/order/assign`, assign)
      .then(({data}) => {
        this.$bus.$emit('toaster',{status: 'success', message: 'Existing Staffer assigned to Order!'})
        this.$parent.$emit('update-row', data)
        //this.$parent.$emit('re-sort')
        this.$parent.$emit('cancel-overlay')
        
      })
      .catch(e => {
        let {message, stack} = e.response.data
        this.$bus.$emit('toaster',{status: 'error', message})
        console.log(stack)
      })
      
    },
    async assignApplicantData (data) {
      await this.getJobApplicantRecords()
      .then(() => {
        this.jobApplicantId = data.Id
      })
      .catch(e => console.log(e))
      
    },
    async newApplicant () {
      this.$emit('subsection', 'new-applicant', this.stafferId)
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
  .form-row:nth-child(2){grid-template-columns: auto max-content;align-items: center;}
}
</style>

