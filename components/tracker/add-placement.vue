<template>
  <div>

    <div class="overlay-heading">
      <h3>Adding New Order</h3>
    </div>

    <div class="form">
      <div class="form-row">
        <div class="form-cell">
          <label>Job Title</label>
          <input type="text" v-model="placement.AVTRRT__Job_Title__c">
        </div>
        <div class="form-cell">
          <label>Client</label>
          <select v-model="placement.AVTRRT__Employer__c">
            <option v-for="(client, idx) in $bus.accounts" :key="`client-${idx}`" :value="client.Id">{{client.Name}}</option>
          </select>
        </div>
      </div>
    

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

        <div class="form-cell">
          <label>Recruiter</label>
          <select v-model="placement.AVTRRT__Recruiter__c">
            <option v-for="(user, idx) in $bus.users" :key="`user-${idx}`" :value="user.Id">{{user.FirstName}} {{user.LastName}}</option>
          </select>
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
        <button @click="createPlacement" :disabled="!edited">Create New Order</button>
      </div>

    </div>
  </div>
</template>

<script>
let emptyPlacement = {
  AVTRRT__Job_Title__c: '',
  AVTRRT__Recruiter__c: '',
  AVTRRT__Employer__c: '',
  AVTRRT__Start_Date__c: '',
  AVTRRT__End_Date__c: '',
  PO__c: '',
  Department__c: '',
  Crew__c: '',
  Shift__c: '',
  Rotation_Communication__c: '',
  Client_Location__c: '',
  Flight__c: '',
  Coverage__c: '',
  Additional_Notes__c: 'New Order'
}

export default {
  props: [],
  data () {
    return {
      placement: Object.assign({}, emptyPlacement),
      edited: false
    }
  },
  created () {
    this.placement.Rotation_Communication__c = ''
    this.placement.Deployment_Forms__c = ''
    this.$nextTick(() => this.edited = false)
  },
  mounted () {
    this.$bus.log(this.$bus.metadata)
  },
  methods: {
    async createPlacement () {
      //clean up placement extension

      let add = Object.assign({}, JSON.parse(JSON.stringify(this.placement)))

      this.$bus.log(JSON.stringify(add, null, '\t'))

      await this.$axios.post(`/tracker/create`, add)
      .then(({data}) => {
        this.$bus.$emit('toaster',{status: 'success', message: 'New Placement Created!'})
        this.$parent.$emit('prepend-row', data)
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
        this.edited = JSON.stringify(val) != JSON.stringify(emptyPlacement)
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
  .form-row:nth-child(1){grid-template-columns: 1fr 1fr;}
  .form-row:nth-child(2){grid-template-columns: 1fr 1fr 2fr 2fr;}
  .form-row:nth-child(3){grid-template-columns: 3fr 1fr 1fr;}
  .form-row:nth-child(4){grid-template-columns: 3fr 1fr 1fr;}
  .form-row:nth-child(5){grid-template-columns: 1fr 1fr;}
}
</style>

