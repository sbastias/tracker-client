<template>
  <div>

    <div class="overlay-heading">
      <h3>Editing {{openOrder && 'Order' || 'Placement'}}</h3>
    </div>

    <h4>{{placement.AVTRRT__Job_Title__c}}</h4>
    <h5>{{placement.AVTRRT__Employer__r.Name}} ({{placement.Supplier__c}})</h5>
    <h5>{{placement.AVTRRT__Contact_Candidate__r.FirstName}} {{placement.AVTRRT__Contact_Candidate__r.LastName}}</h5>
    <h5 v-if="placement.AVTRRT__Pay_Rate__c">${{placement.AVTRRT__Pay_Rate__c}} <span v-if="placement.AVTRRT__Contact_Candidate__r.Pay_Rate_Adjustment__c">(+{{placement.AVTRRT__Contact_Candidate__r.Pay_Rate_Adjustment__c}})</span></h5>

<!--







Coverage
WFR Number

-->

    <div class="form">

      <div class="form-row">

        <div class="form-cell">
          <label>Inbound Date</label>
          <Datepicker :value="new Date(placement.AVTRRT__Start_Date__c)" format="yyyy-MM-dd" :use-utc="true" @input="updateStartDate" />
        </div>

        <div class="form-cell">
          <label>Outbound Date</label>
          <Datepicker :value="new Date(placement.AVTRRT__End_Date__c)" format="yyyy-MM-dd" :use-utc="true" @input="updateEndDate" />
        </div>

        <div class="form-cell">
          <label>PO #</label>
          <input type="text" v-model="placement.PO__c" />
        </div>

        <div class="form-cell">
          <label>Supplier</label>
          <input type="text" v-model="placement.Supplier__c" />
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
        <button @click="updatePlacement" :disabled="!edited">Save Changes</button>
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
  computed: {
    openOrder () {
      return this.originalPlacement.AVTRRT__Contact_Candidate__r.FirstName == 'Open'
    }
  },
  created () {
    this.placement = Object.assign({}, this.originalPlacement)
  },
  mounted () {
    this.$bus.log(this.$bus.metadata)
  },
  methods: {
    updateStartDate (val) {
      this.placement.AVTRRT__Start_Date__c = val.toISOString().substring(0,10)
    },
    updateEndDate (val) {
      this.placement.AVTRRT__End_Date__c = val.toISOString().substring(0,10)
    },
    async updatePlacement () {
      //clean up placement

      let update = Object.assign({}, JSON.parse(JSON.stringify(this.placement)))
      
      update.AVTRRT__Contact_Candidate__c = update.AVTRRT__Contact_Candidate__r.Id
      update.AVTRRT__Employer__c = update.AVTRRT__Employer__r.Id

      delete update.AVTRRT__Contact_Candidate__r
      delete update.AVTRRT__Employer__r
      delete update.Compensation__r
      delete update.Name
      delete update.CreatedDate
      delete update.LastModifiedDate

      this.$bus.log(JSON.stringify(update, null, '\t'))

      await this.$axios.post(`/tracker/update`, update)
      .then(({data}) => {
        this.$bus.$emit('toaster',{status: 'success', message: 'Placement Updated!'})
        this.$parent.$emit('update-row', data)
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

  .form-row:nth-child(1){grid-template-columns: 1fr 1fr 1fr 1fr;}
  .form-row:nth-child(2){grid-template-columns: 3fr 1fr 1fr;}
  .form-row:nth-child(3){grid-template-columns: 3fr 1fr 1fr;}
  .form-row:nth-child(4){grid-template-columns: 1fr 1fr;}
}
</style>

