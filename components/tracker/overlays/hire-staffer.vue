<template>
  <div>

    <div class="overlay-heading">
      <h3>Hire New Staffer</h3>
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
              {{staffer.FirstName}} {{staffer.LastName}} ({{staffer.Shortcode__c}})
            </option>
          </select>
        </div>

      </div>

      <template v-if="stafferId">

        <div class="form-row">

          <div class="form-cell">
          
            <label>Select Job Applicant No.</label>
            <select v-model="jobApplicantId">
              <option v-for="(applicant, idx) in jobApplicants" :key="`applicant-${idx}`" :value="applicant.Id">
                #{{applicant.Name}} - {{applicant.AVTRRT__Account_Job__r.Shortcode__c}} :: {{applicant.AVTRRT__Job_Title__c}} ({{applicant.AVTRRT__Stage__c}})
              </option>
            </select>
          </div>

          <div class="form-cell">
            <button @click="newApplicant">Create Applicant Record</button>
          </div>

        </div>


        <template v-if="revisedApplicant">
          <div class="form-row">
            <div class="form-cell">
              <label>Job Title</label>
              <input v-model="revisedApplicant.AVTRRT__Job_Title__c">
            </div>
            <div class="form-cell">
              <label>Starting Work Location</label>
              <input v-model="revisedApplicant.Starting_Work_Location__c">
            </div>
          </div>
          <div class="form-row">
            <div class="form-cell">
              <label>Start Date</label>
              <datepicker class="hire-start-date" v-model="revisedApplicant.Expected_Start_Date__c" format="yyyy-MM-dd" />
            </div>
            <div class="form-cell">
              <label>Shift</label>
              <select v-model="revisedApplicant.Shift__c">
                <option v-for="(shift, idx) in $bus.metadata.find(el => el.fullName == 'AVTRRT__Job_Applicant__c').fields.find(el => el.fullName == 'Shift__c').valueSet.valueSetDefinition.value" :key="`shift-option-${idx}`" :value="shift.label">{{shift.fullName}}</option>
              </select>
            </div>
            <div class="form-cell">
              <label>Rotation</label>
              <select v-model="revisedApplicant.Rotation__c">
                <option v-for="(rotation, idx) in $bus.metadata.find(el => el.fullName == 'AVTRRT__Job_Applicant__c').fields.find(el => el.fullName == 'Rotation__c').valueSet.valueSetDefinition.value" :key="`rotation-option-${idx}`" :value="rotation.label">{{rotation.fullName}}</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-cell">
              <label>Overtime Policy</label>
              <select v-model="revisedApplicant.Overtime_Policy__c">
                <option v-for="(otPolicy, idx) in $bus.metadata.find(el => el.fullName == 'AVTRRT__Job_Applicant__c').fields.find(el => el.fullName == 'Overtime_Policy__c').valueSet.valueSetDefinition.value" :key="`ot-policy-option-${idx}`" :value="otPolicy.label">{{otPolicy.fullName}}</option>
              </select>
            </div>
            <div class="form-cell">
              <label>Vac Pay/Stat Holidays</label>
              <select v-model="revisedApplicant.Rate_Includes__c">
                <option v-for="(vacstat, idx) in $bus.metadata.find(el => el.fullName == 'AVTRRT__Job_Applicant__c').fields.find(el => el.fullName == 'Rate_Includes__c').valueSet.valueSetDefinition.value" :key="`vacstat-option-${idx}`" :value="vacstat.label">{{vacstat.fullName}}</option>
              </select>
            </div>
            <div class="form-cell">
              <label>Licenses Required</label>
              <select v-model="revisedApplicant.Licenses_Required__c">
                <option v-for="(licenses, idx) in $bus.metadata.find(el => el.fullName == 'AVTRRT__Job_Applicant__c').fields.find(el => el.fullName == 'Licenses_Required__c').valueSet.valueSetDefinition.value" :key="`licenses-option-${idx}`" :value="licenses.label">{{licenses.fullName}}</option>
              </select>
            </div>
            
            <div class="form-cell">
              <label>Travel Policy</label>
              <select v-model="revisedApplicant.Travel_Policy__c">
                <option v-for="(travel, idx) in $bus.metadata.find(el => el.fullName == 'AVTRRT__Job_Applicant__c').fields.find(el => el.fullName == 'Travel_Policy__c').valueSet.valueSetDefinition.value" :key="`travel-option-${idx}`" :value="travel.label">{{travel.fullName}}</option>
              </select>
            </div>
          </div>

        </template>


      </template>

      <div class="form-controls">
        <button @click="hireStaffer" :disabled="!(stafferId && jobApplicantId)">Hire Staffer</button>
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
      jobApplicants: [],
      revisedApplicant: false
    }
  },
  computed: {
    jobApplicant () {
      return this.jobApplicantId && this.jobApplicants.find(el => el.Id = this.jobApplicantId)
    }
  },
  created () {
    this.$bus.$on('assign-applicant-to-staffer', this.assignApplicantData)
  },
  beforeDestroy () {
    this.$bus.$off('assign-applicant-to-staffer')
  },
  async fetch () {
    return await this.$axios.get(`/tracker/hires/load`)
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
    async hireStaffer () {
      //clean up placement extension

      let hire = {
        Id: this.placement.Id, 
        AVTRRT__Contact_Candidate__c: this.stafferId,
        AVTRRT__Job_Applicant__c: this.jobApplicantId,
        AVTRRT__Job__c: this.jobApplicant.AVTRRT__Job__c,
        AVTRRT__Hiring_Manager__c: this.jobApplicant.AVTRRT__Hiring_Manager__c,
        Compensation__c: this.jobApplicant.Compensation__c,
        revisedApplicant: this.revisedApplicant
        
      }

      delete hire.revisedApplicant.Name
      delete hire.revisedApplicant.AVTRRT__Account_Job__r
      delete hire.revisedApplicant.attributes

      this.$bus.log(JSON.stringify(hire, null, '\t'))


      await this.$axios.post(`/tracker/order/hire`, hire)
      .then(({data}) => {
        this.$bus.$emit('toaster',{status: 'success', message: 'NEW Staffer assigned to Order - Offer Sent!'})
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
    jobApplicant (val) {
      this.revisedApplicant = Object.assign({}, JSON.parse(JSON.stringify(this.jobApplicant)))
    } 
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/forms.scss';
.form {
  margin-top: 20px;
  
  .form-row:nth-child(1){grid-template-columns: 100%;}
  .form-row:nth-child(2){grid-template-columns: auto max-content;align-items: center;}
  .form-row:nth-child(3){grid-template-columns: 2fr 1fr;}
  .form-row:nth-child(4){grid-template-columns: 1fr 1fr 2fr;}
  .form-row:nth-child(5){grid-template-columns: 1fr 1fr 1fr 1fr;}
}
</style>

<style>
.hire-start-date .vdp-datepicker__calendar {
  bottom: 100%;
}
</style>

