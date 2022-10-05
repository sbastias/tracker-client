<template>
  <div>

    <div class="overlay-heading">
      <h3>Extending Placement</h3>
    </div>

    <h4>{{placement.AVTRRT__Job_Title__c}}</h4>
    <h5>{{placement.AVTRRT__Employer__r.Name}}</h5>
    <h5>{{placement.AVTRRT__Contact_Candidate__r.FirstName}} {{placement.AVTRRT__Contact_Candidate__r.LastName}}</h5>
    <h5 v-if="placement.candidateCompensation">Placement Rate: ${{placement.candidateCompensation}} <span v-if="placement.AVTRRT__Contact_Candidate__r.Pay_Rate_Adjustment__c">(+${{placement.AVTRRT__Contact_Candidate__r.Pay_Rate_Adjustment__c.toFixed(2)}})</span></h5>
    <h5 v-if="placement.jobApplicantPayRate">Offer Rate: ${{placement.jobApplicantPayRate}}</h5>

<!--







Coverage
WFR Number

-->

    <div class="form">

      <div class="form-row">

        <div class="form-cell">
          <label>Inbound Date</label>
          <Datepicker v-model="placement.AVTRRT__Start_Date__c" format="yyyy-MM-dd" :use-utc="true" />
        </div>

        <div class="form-cell">
          <label>Outbound Date</label>
          <Datepicker v-model="placement.AVTRRT__End_Date__c" format="yyyy-MM-dd" :use-utc="true" />
        </div>

        <div class="form-cell">
          <label>PO #</label>
          <input type="text" v-model="placement.PO__c" />
        </div>

      </div>

      <div class="form-row">

        <div class="form-cell">
          <label>Department</label>
          <select v-model="placement.Department__c">
            <option v-for="(dept, idx) of $bus.metadata.find(el => el.fullName == 'Department').customValue" :key="`dept-option-${idx}`" :value="dept.fullName">{{dept.fullName}}</option>
          </select>
        </div>

        <div class="form-cell">
          <label>Crew</label>
          <select v-model="placement.Crew__c">
            <option v-for="(crew, idx) of $bus.metadata.find(el => el.fullName == 'Crews').customValue" :key="`crew-option-${idx}`" :value="crew.fullName">{{crew.fullName}}</option>
          </select>
        </div>

        <div class="form-cell">
          <label>Shift</label>
          <select v-model="placement.Shift__c">
            <option v-for="(shift, idx) in $bus.metadata.find(el => el.fullName == 'AVTRRT__Placement__c').fields.find(el => el.fullName == 'Shift__c').valueSet.valueSetDefinition.value" :key="`shift-option-${idx}`" :value="shift.label">{{shift.fullName}}</option>
          </select>
        </div>

      </div>
        
      <div class="form-row">

        <div class="form-cell">
          <label>Rotation Communication</label>
          <select v-model="placement.Rotation_Communication__c">
            <option v-for="(comm, idx) in $bus.metadata.find(el => el.fullName == 'AVTRRT__Placement__c').fields.find(el => el.fullName == 'Rotation_Communication__c').valueSet.valueSetDefinition.value" :key="`comm-option-${idx}`" :value="comm.label">{{comm.fullName}}</option>
          </select>
        </div>

        <div class="form-cell">
          <label>Client Location</label>
          <select v-model="placement.Client_Location__c">
            <option v-for="(location, idx) in $bus.metadata.find(el => el.fullName == 'AVTRRT__Placement__c').fields.find(el => el.fullName == 'Client_Location__c').valueSet.valueSetDefinition.value" :key="`location-option-${idx}`" :value="location.label">{{location.fullName}}</option>
          </select>
        </div>

        <div class="form-cell">
          <label>Flights</label>
          <select v-model="placement.Flight__c">
            <option v-for="(flight, idx) in $bus.metadata.find(el => el.fullName == 'AVTRRT__Placement__c').fields.find(el => el.fullName == 'Flight__c').valueSet.valueSetDefinition.value" :key="`flight-option-${idx}`" :value="flight.label">{{flight.fullName}}</option>
          </select>
        </div>

      </div>

      <div class="form-row">

        <div class="form-cell">
          <label>Coverage</label>
          <textarea v-model="placement.Coverage__c" />
        </div>

        <div class="form-cell">
          <label>Additional Notes</label>
          <textarea v-model="placement.Additional_Notes__c" />
        </div>

      </div>

      <div class="form-controls">
        <button @click="createExtension" :disabled="!edited">Create Extension</button>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  props: ['original-placement'],
  data () {
    return {
      placement: {},
      edited: false
    }
  },
  created () {
    this.placement = Object.assign({}, this.originalPlacement)
    this.placement.Rotation_Communication__c = ''
    this.placement.Deployment_Forms__c = ''
    this.$nextTick(() => this.edited = false)
  },
  mounted () {
    this.$bus.log(this.$bus.metadata)
  },
  methods: {
    async createExtension () {
      //clean up placement extension

      let ext = Object.assign({}, JSON.parse(JSON.stringify(this.placement)))
      
      ext.AVTRRT__Contact_Candidate__c = ext.AVTRRT__Contact_Candidate__r.Id
      ext.AVTRRT__Employer__c = ext.AVTRRT__Employer__r.Id

      delete ext.AVTRRT__Contact_Candidate__r
      delete ext.AVTRRT__Employer__r
      delete ext.Compensation__r
      //delete ext.Id //deleted server-side
      delete ext.Name
      delete ext.CreatedDate
      delete ext.LastModifiedDate
      delete ext.candidateCompensation
      delete ext.jobApplicantPayRate
      delete ext.AVTRRT__Job_Applicant__r
      delete ext.searchableText

      ext.AVTRRT__Extension__c = true
      ext.Checkbox1__c = true

      this.$bus.log(JSON.stringify(ext, null, '\t'))

      await this.$axios.post(`/tracker/extend`, ext)
      .then(({data}) => {
        this.$bus.$emit('toaster',{status: 'success', message: 'Placement Extension Created!'})
        this.$parent.$emit('insert-row', data)
        this.$parent.$emit('cancel-overlay')
        this.edited = false
      })
      .catch(e => {
        let {message, stack} = e.response.data
        this.$bus.$emit('toaster',{status: 'error', message})
        console.log(stack)
      })
      
    }
  },
  watch: {
    placement: {
      deep: true,
      handler (val) { 
        this.$bus.log('edited')
        this.edited = JSON.stringify(val) != JSON.stringify(this.originalPlacement)
      }
    },
    edited (val) {
      this.$emit('edited', val)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~/assets/scss/forms.scss';
.form {
  margin-top: 20px;

  .form-row:nth-child(1){grid-template-columns: 1fr 1fr 3fr;}
  .form-row:nth-child(2){grid-template-columns: 3fr 1fr 1fr;}
  .form-row:nth-child(3){grid-template-columns: 3fr 1fr 1fr;}
  .form-row:nth-child(4){grid-template-columns: 1fr 1fr;}
}
</style>

