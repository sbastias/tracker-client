<template>
  <div>

    <div class="overlay-heading">
      <h3>Creating New Applicant</h3>
    </div>


    <div>{{placement.AVTRRT__Employer__r.Name}}</div>
    <div>{{placement.Department__c}}</div>

    <br><br>

    <div v-if="loadingJobs">
      <LoadingGraphic message="Loading Jobs..." />
      <br><br>
    </div>

    <div class="form" v-else>

      <div class="form-row">
        
        <div class="form-cell">
         
          <label>Select Job</label>
          <select v-model="jobId">
            <option v-for="(job, idx) in jobs" :key="`job-${idx}`" :value="job.AVTRRT__Job__r.Id">
              {{job.AVTRRT__Job__r.Name}} - {{job.AVTRRT__Job__r.AVTRRT__Job_Title__c}}
            </option>
          </select>
        </div>

        <div class="form-cell">
         
          <label>Compensation</label>
          <select v-model="compId">
            <option v-for="(comp, idx) in comps" :key="`comp-${idx}`" :value="comp.Id">
              {{comp.Name}}
            </option>
          </select>
        </div>


      </div>
      

      <div class="form-controls">
        <button @click="createApplicant" :disabled="false">Create Applicant</button>
      </div>

    </div>
  </div>
</template>

<script>
import LoadingGraphic from '~/components/ui/LoadingGraphic'



export default {
  props: ['placement','parent-id'],
  components: {
    LoadingGraphic
  },
  data () {
    return {
      jobApplicantId: '',
      loadingJobs: true,
      jobApplicants: [],
      jobs: [],
      comps: [],
      jobId: false,
      compId: false,
      payType: false
    }
  },
  async fetch () {
    let data = {
      department: this.placement.Department__c,
      clientId: this.placement.AVTRRT__Employer__r.Id
    }
    await this.$axios.post(`/tracker/jobs/load`, data)
    .then(({data}) => {
      this.jobs = data.jobs
      this.comps = data.compensations
      this.loadingJobs = false
    })
    .catch(e => {
      let {message, stack} = e.response.data
      this.$bus.$emit('toaster',{status: 'error', message})
      console.log(stack)
    })

  },
  created () {

  },
  
  mounted () {
    //this.$bus.log(this.$bus.metadata)

  },
  methods: {
    async createApplicant () {

      let applicantData = {
        AVTRRT__Job__c: this.jobId,
        Compensation__c: this.compId,
        AVTRRT__Contact_Candidate__c: this.parentId
      }

      return await this.$axios.post(`/tracker/applicant/create`, applicantData)
      .then(({data}) => {

        applicantData.Id = data.id

        this.$bus.$emit('assign-applicant-to-staffer', applicantData)
        this.$emit('deactivate')
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
  
  .form-row:nth-child(1){grid-template-columns: 2fr 1fr;}
  
}
</style>

