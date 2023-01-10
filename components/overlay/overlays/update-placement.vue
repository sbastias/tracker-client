<template>
  <div>

    <div class="overlay-heading">
      <h3>Editing {{openOrder && 'Order' || 'Placement'}}</h3>
    </div>

    
    <div><input class="title-input" type="text" v-model="placement.AVTRRT__Job_Title__c" /></div>
    <h5>{{placement.AVTRRT__Employer__r.Name}} <span v-if="placement.Supplier__c">({{placement.Supplier__c}})</span></h5>
    <h5>{{placement.AVTRRT__Contact_Candidate__r.FirstName}} {{placement.AVTRRT__Contact_Candidate__r.LastName}}</h5>
    <h5 v-if="placement.candidateCompensation">Placement Rate: ${{placement.candidateCompensation}} <span v-if="placement.AVTRRT__Contact_Candidate__r.Pay_Rate_Adjustment__c">(+${{placement.AVTRRT__Contact_Candidate__r.Pay_Rate_Adjustment__c.toFixed(2)}})</span></h5>
    <h5 v-if="placement.jobApplicantPayRate">Offer Rate: ${{placement.jobApplicantPayRate}}</h5>

<!--







Coverage
WFR Number

-->

    <div class="form" v-if="!assignProspect">

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
          <select v-model="placement.Supplier__c">
            <option value="BSNI">BSNI</option>
            <option value="YORK">YORK</option>
            <option value="QAJAQ">QAJAQ</option>
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
            <option value="">None</option>
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
          <label>Airport</label>
          <select v-model="placement.Client_Airport__c">
            <option v-for="(airport, idx) of $bus.metadata.find(el => el.fullName == 'Airport').customValue" :key="`airport-option-${idx}`" :value="airport.fullName">{{airport.fullName}}</option>
          </select>
        </div>

        <div class="form-cell">
          <label>Deployment Forms</label>
          <select v-model="placement.Deployment_Forms__c">
            <option v-for="(deployment, idx) in $bus.metadata.find(el => el.fullName == 'AVTRRT__Placement__c').fields.find(el => el.fullName == 'Deployment_Forms__c').valueSet.valueSetDefinition.value" :key="`deployment-option-${idx}`" :value="deployment.label">{{deployment.fullName}}</option>
          </select>
        </div>

        <div class="form-cell">
          <label>Internal Status</label>
          <select v-model="placement.Internal_Status__c">
            <option value="">None</option>
            <option v-for="(status, idx) in $bus.metadata.find(el => el.fullName == 'AVTRRT__Placement__c').fields.find(el => el.fullName == 'Internal_Status__c').valueSet.valueSetDefinition.value" :key="`status-option-${idx}`" :value="status.label">{{status.fullName}}</option>
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

        <div class="form-cell" id="prospect-list-container" v-if="openOrder">
          <label>Prospects</label>
          <ul v-if="placement.Prospects__r.records.length">
            <li v-for="(prospect,idx) in placement.Prospects__r.records" :key="`prospect-${idx}`">
              <span>{{prospect.Name}}</span>
              <span>
                <span :data-id="prospect.Id" @click="deleteProspect"></span>
              </span>
            </li>
          </ul>
          <span v-else>No prospects</span>
          <div style="margin-top: 8px; font-size: .9em;"><a @click="assignProspect = true">Assign New Prospect</a></div>
        </div>

      </div>


      <div class="form-controls">
        <button @click="updatePlacement" :disabled="!edited">Save Changes</button>
      </div>

    </div>

    <div class="form" v-if="assignProspect" id="assign-prospect">
        
      <div id="new-prospect-row" class="form-row">
        <div class="form-cell">
          <label for="new-prospect">Select New Prospect</label>
          <select id="new-prospect" v-model="newProspect">
            <option value=""></option>
            <option v-for="(prospect, idx) in staffers" :key="`prospect-opt-${idx}`" :value="prospect.Id">{{prospect.FirstName}} {{prospect.LastName}}</option>
          </select>
        </div>
        <div class="form-cell"><button @click="addProspect" :disabled="assigningProspect">Add New Prospect</button></div>
        <div class="form-cell"><button @click="assignProspect = false" :disabled="assigningProspect">Cancel</button></div>
      </div>

    </div>

  </div>
</template>

<script>
import CancelX from '~/components/ui/CancelX'
export default {
  props: ['original-placement'],
  components: {CancelX},
  data () {
    return {
      placement: {},
      edited: false,
      staffers: [],
      loadingStaffers: false,
      assignProspect: false,
      assigningProspect: false,
      newProspect: false,
      testProspects: [
        {Name: 'Test Test'},
        {Name: 'Test Test'},
        {Name: 'Test Test'},
        {Name: 'Test Test'},
        {Name: 'Test Test'},
      ]
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
    //this.$bus.log(this.$bus.metadata)
    console.log(JSON.stringify(this.placement))
    
  },
  async fetch () {
    return await this.$axios.get(`/tracker/prospects/load`)
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
  methods: {
    async addProspect () {

      this.assigningProspect = true

      let data = {
        prospectId: this.newProspect,
        placementId: this.placement.Id
      }

      return await this.$axios.post(`/tracker/assign/prospect`, data)
      .then(({data}) => {
        this.$parent.$parent.placements.find(el => el.Id == this.placement.Id).Prospects__r.records.push(data)
        this.assignProspect = false
      })
      .catch(e => {
        console.log(e)
        this.$bus.$emit('toaster', {status: 'error', message: e.meesage})
      })
      .finally(() => {
        this.assigningProspect = false
      })

    },
    async deleteProspect ($ev) {

      return await this.$axios.delete(`/tracker/delete/prospect/${$ev.target.dataset.id}`)
      .then(({data}) => {
        let prospects = this.$parent.$parent.placements.find(el => el.Id == this.placement.Id).Prospects__r.records
        let deletedIdx = prospects.indexOf(prospects.find(el => el.Id == data.id))
        prospects.splice(deletedIdx, 1)
      })
      .catch(e => {
        console.log(e)
        this.$bus.$emit('toaster', {status: 'error', message: e.meesage})
      })

    },
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
      delete update.candidateCompensation
      delete update.jobApplicantPayRate
      delete update.searchableText
      delete update.AVTRRT__Job_Applicant__r
      delete update.Prospects__r

      this.$bus.log(JSON.stringify(update, null, '\t'))

      await this.$axios.post(`/tracker/update`, update)
      .then(async ({data}) => {
        this.$bus.$emit('toaster',{status: 'success', message: 'Placement Updated!'})
        this.$parent.$emit('update-row', data)
        this.$parent.$emit('cancel-overlay')
        this.edited = false

        if (this.originalPlacement.Internal_Status__c != data.Internal_Status__c && data.Internal_Status__c == 'Cancel and Replicate') {
          await this.$axios.post(`/tracker/handle/decline`, {Id: data.Id, Internal_Status__c: 'Cancel and Replicate' })
        }
        if (this.originalPlacement.Rotation_Communication__c != data.Rotation_Communication__c && data.Rotation_Communication__c == 'Rotation Declined') {
          await this.$axios.post(`/tracker/handle/decline`, {Id: data.Id, Rotation_Communication__c: 'Rotation Declined' })
        }
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
//@import '~/assets/scss/forms.scss';

.form {
  margin-top: 20px;

  .form-row:nth-child(1){grid-template-columns: 1fr 1fr 1fr 1fr;}
  .form-row:nth-child(2){grid-template-columns: 3fr 1fr 1fr;}
  .form-row:nth-child(3){grid-template-columns: 3fr 1fr 1fr;}
  .form-row:nth-child(4){grid-template-columns: 1fr 1fr 1fr;}
  .form-row:nth-child(5){grid-template-columns: 1fr 1fr 1fr;}

  

  #prospect-list-container {
    ul {
      overflow: scroll;
      max-height: 50px;
      padding-left: 15px;
      li{
        display: grid;
        grid-template-columns: auto max-content;
        > span:last-child {

          padding-right: 25px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          height: 100%;

          > span {
            display: inline-block;
            width: 12px;
            height: 12px;
            cursor: pointer;
            background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDMuNjEgMjAzLjYxIj48cGF0aCBkPSJNMTk2LjM4LDE2MS40OWwtNTkuNjktNTkuNjksNTkuNjktNTkuNjljOS42NC05LjY0LDkuNjQtMjUuMjYsMC0zNC44OWgwYy05LjY0LTkuNjQtMjUuMjYtOS42NC0zNC44OSwwbC01OS42OSw1OS42OUw0Mi4xMiw3LjIzYy05LjY0LTkuNjQtMjUuMjYtOS42NC0zNC44OSwwaDBjLTkuNjQsOS42NC05LjY0LDI1LjI2LDAsMzQuODlsNTkuNjksNTkuNjlMNy4yMywxNjEuNDljLTkuNjQsOS42NC05LjY0LDI1LjI2LDAsMzQuODloMGM5LjY0LDkuNjQsMjUuMjYsOS42NCwzNC44OSwwbDU5LjY5LTU5LjY5LDU5LjY5LDU5LjY5YzkuNjQsOS42NCwyNS4yNiw5LjY0LDM0Ljg5LDBoMGM5LjY0LTkuNjQsOS42NC0yNS4yNiwwLTM0Ljg5WiIgLz48L3N2Zz4=');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: left center;
            &:hover {
              background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDMuNjEgMjAzLjYxIj48cGF0aCBkPSJNMTk2LjM4LDE2MS40OWwtNTkuNjktNTkuNjksNTkuNjktNTkuNjljOS42NC05LjY0LDkuNjQtMjUuMjYsMC0zNC44OWgwYy05LjY0LTkuNjQtMjUuMjYtOS42NC0zNC44OSwwbC01OS42OSw1OS42OUw0Mi4xMiw3LjIzYy05LjY0LTkuNjQtMjUuMjYtOS42NC0zNC44OSwwaDBjLTkuNjQsOS42NC05LjY0LDI1LjI2LDAsMzQuODlsNTkuNjksNTkuNjlMNy4yMywxNjEuNDljLTkuNjQsOS42NC05LjY0LDI1LjI2LDAsMzQuODloMGM5LjY0LDkuNjQsMjUuMjYsOS42NCwzNC44OSwwbDU5LjY5LTU5LjY5LDU5LjY5LDU5LjY5YzkuNjQsOS42NCwyNS4yNiw5LjY0LDM0Ljg5LDBoMGM5LjY0LTkuNjQsOS42NC0yNS4yNiwwLTM0Ljg5WiIgZmlsbD0iIzk5MDAwMCIgLz48L3N2Zz4=');
            }
          }
        }
      }
    }
    
  }
}

#new-prospect-row {
  margin: 30px 0;
    display: grid;
    grid-gap: 10px;
    grid-template-columns: auto max-content max-content;
    align-items: center;
    select {
      width: 100%;
    }
  }
</style>

