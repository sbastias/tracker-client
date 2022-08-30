<template>
<client-only>
  <div class="placement-row-contents" :class="[placement.Rotation_Communication__c && placement.Rotation_Communication__c.toLowerCase().split(' ').join('-') || 'None',{edited}]" :active="active">
    <div class="row" @click="activate">
      <div class="id">
        <label>Placement #</label>
        <a :href="sfLink(placement.Id, 'AVTRRT__Placement__c')" target="_blank">
          {{placement.Name}}
        </a>
      </div>

      <div class="email">
        <a class="email-icon" :href="`mailto:${placement.Candidate.Email}`" target="_blank" :title="placement.Candidate.Email"><EmailIcon /></a>
      </div>

      <div class="name ellipses">
        <label>Contractor Name</label>
        <a :href="sfLink(placement.Candidate.Id, 'Contact')" target="_blank">{{placement.Candidate.Name}}</a>
      </div>
      
      <div class="account">
        <label>Client</label>
        <span>{{placement.AVTRRT__Employer__r.Shortcode__c}}</span>
      </div>
      <div data-field="job-title" class="ellipses">
        <label>Job Title</label>
        <span>{{placement.AVTRRT__Job_Title__c}}</span>
      </div>
      <div data-field="start-date">
        <label>Inbound</label>
        <Datepicker 
          v-if="editing == 'start-date'" 
          v-model="placement.AVTRRT__Start_Date__c"
          format="yyyy/MM/dd"
          :use-utc="true"
        />
        <span @click="edit" v-else>{{moment.utc(placement.AVTRRT__Start_Date__c).format('YYYY/MM/DD')}}</span>
      </div>
      <div data-field="end-date">
        <label>Outbound</label>
        <Datepicker 
          v-if="editing == 'end-date'" 
          v-model="placement.AVTRRT__End_Date__c"
          format="yyyy/MM/dd"
          :use-utc="true"
        />
        <span @click="edit" v-else>{{moment.utc(placement.AVTRRT__End_Date__c).format('YYYY/MM/DD')}}</span>
      </div>
    </div>

    

    <div class="row" v-show="active">  
      <div data-field="shift">
        <label>Shift</label>
        <select v-if="editing == 'shift'" v-model="placement.Shift__c">
          <option v-for="(shift, idx) in $bus.metadata.find(el => el.fullName == 'AVTRRT__Placement__c').fields.find(el => el.fullName == 'Shift__c').valueSet.valueSetDefinition.value" :key="`shift-option-${idx}`" :value="shift.label">{{shift.fullName}}</option>
        </select>
        <span @click="edit" v-else>{{placement.Shift__c || 'N/A'}}</span>
      </div>
      <div class="">
        <label>Department</label>
        {{placement.Department__c}}
      </div>
      <div data-field="crew">
        <label>Crew</label>
        <select v-if="editing == 'crew'" v-model="placement.Crew__c">
          <option v-for="(crew, idx) in $bus.metadata.find(el => el.fullName == 'Crews').customValue" :key="`crew-option-${idx}`" :value="crew.label">{{crew.fullName}}</option>
        </select>
        <span @click="edit" v-else>{{placement.Crew__c}}</span>
      </div>
      <div class="">
        <label>Location</label>
        {{placement.Client_Location__c}}
      </div>
      <div data-field="rot-comm">
        <label>Rotation Communication</label>
        <select v-if="editing == 'rot-comm'" v-model="placement.Rotation_Communication__c">
          <option v-for="(comm, idx) in $bus.metadata.find(el => el.fullName == 'AVTRRT__Placement__c').fields.find(el => el.fullName == 'Rotation_Communication__c').valueSet.valueSetDefinition.value" :key="`comm-option-${idx}`" :value="comm.label">{{comm.fullName}}</option>
        </select>
        <span @click="edit" v-else>{{placement.Rotation_Communication__c}}</span>
        
      </div>
    </div>

    <div class="row" v-show="active">
      <div class="" data-field="notes">
        <label>Notes</label>
        <textarea v-model="placement.Additional_Notes__c" v-if="editing == 'notes'"></textarea>
        <div class="scrolling-text" @click="edit" v-else>{{placement.Additional_Notes__c}}</div>
      </div>
      <div class="">
        <label>Coverage</label>
        {{placement.Coverage__c}}
      </div>
      <div class="">
        <label>PO #</label>
        {{placement.PO__c}}
      </div>
      <div class="">
        <label>Airport</label>
        {{placement.Client_Airport__c}}
      </div>
      <div class="">
        <label>Pay Rate</label>
        {{ payRateString(placement) }}
      </div>
    </div>

    <div class="controls-row" v-show="active">
      <button @click="deactivate">Close</button>
      <button @click="extend">Extend Placement</button>
      <button @click="update" :disabled="!edited">Save Changes</button>
    </div>

  
  </div>
</client-only>
</template>



<script>
import moment from 'moment'
import EmailIcon from '~/components/ui/EmailIcon'


export default {
  props: ['original-placement','active'],
  components: {
    EmailIcon
  },
  data () {
    return {
      moment,
      mode: 'classic',
      editing: false,
      edited: false
    }
  },
  created () {
    this.replicateOriginal()
  },
  computed: {
    
  },
  methods: {
    replicateOriginal () {
      this.placement = Object.assign({}, this.originalPlacement)
    },
    activate () {
      this.$emit('activate', this.placement.Id)
    },
    deactivate () {
      
      if (this.edited) {
        if (confirm('This placement has unsaved edits. You will lose any unsaved changes. Close anyway?')) {
          this.$emit('deactivate', this.placement.Id)
          this.replicateOriginal()
        }
      } else this.$emit('deactivate', this.placement.Id)
      
    },
    async update () {

      let update = Object.assign({}, this.placement)

      delete update.Candidate
      delete update.Compensation__r
      delete update.AVTRRT__Employer__r
      delete update.CreatedDate
      delete update.Name
      
      await this.$axios.post(`/tracker/update`, update)
      .then(({data}) => {
        console.log(data)
        this.$bus.$emit('toaster', {status: 'success', message: 'Placement has been updated!'})
        this.edited = false
      })
      .catch(e => {
        let {message, stack} = e.response.data
        this.$bus.$emit('toaster', {status: 'error', message})
        console.log(stack)
      })

    },
    extend () {
      this.$emit('extend', this.placement)
    },
    edit ($ev) {

      if (!this.active) return

      let fieldContainer = $ev.target.closest('div[data-field]')

      this.editing = fieldContainer.dataset.field

      //console.log('Trying to edit', this.editing)

      this.$nextTick(() => {
        let inputField = fieldContainer.querySelector('input, textarea,select')
        inputField.addEventListener('blur', () => {
          this.editing = false
          this.placement.AVTRRT__Start_Date__c = this.moment.utc(new Date(this.placement.AVTRRT__Start_Date__c)).format('YYYY-MM-DD')
          this.placement.AVTRRT__End_Date__c = this.moment.utc(new Date(this.placement.AVTRRT__End_Date__c)).format('YYYY-MM-DD')
          this.edited = JSON.stringify(this.placement) != JSON.stringify(this.originalPlacement)
        })
        inputField.focus()
        inputField.click()
      })
      
    },
    sfLink (objectId, objectType) {
      return this.mode == 'classic' ? `https://thebullittgroup.my.salesforce.com/${objectId}` : `https://thebullittgroup.lightning.force.com/lightning/r/${objectType}/${objectId}/view`
    },
    payRateString (placement) {

      let payRate = false
      let adjustment = ''

      if (placement.Compensation__r) {
        payRate = Number(placement.Compensation__r.Default_Pay_Rate__c)
        if (placement.Candidate.Pay_Rate_Adjustment__c) {
          payRate += Number(placement.Candidate.Pay_Rate_Adjustment__c)
          adjustment = ` (+${ placement.Candidate.Pay_Rate_Adjustment__c.toFixed(2) })`
        }
      } else if (placement.Pay_Rate__c) {
        payRate = placement.Pay_Rate__c
      }
      
      return payRate && '$' + payRate.toFixed(2) + adjustment || 'N/A'
    }
  },
  watch: {
    
  }
}
</script>

<style lang="scss">
.placement-row-contents {

  margin-bottom: 0;
  margin-left: 15px;
  border-radius: 5px;

  &.confirmation-received {
    .row:first-child:before {background-color: green;}
    border-color: green;
  }
  &.rotation-information-sent {
    .row:first-child:before {background-color: orange;}
    border-color: orange;
  } 
  &.rotation-declined {
    .row:first-child:before {background-color: darkred;}
    border-color: darkred;
  }
  &.cancelled-hired-by-client {
    .row:first-child:before {background-color: red;}
    border-color: red;
  }
  &.rotation-cancelled-by-client {
    .row:first-child:before {background-color: red;}
    border-color: red;
  }

  &[active] {
    margin-left: 0;
    padding: 20px;
    border-width: 1px; 
    border-style: solid;
    .row {
      &:before {
        display: none!important;
        
      }
    }
  }

  &:not([active]) > .row:first-child {
    cursor:pointer;
    padding: 5px 0;
    &:hover{
      background-color: #eee;
    }
  }

  .row{
    display: grid;
    margin-top: 10px;
    //grid-gap: 15px;
    width: 100%;
    max-width: 100%;
    position: relative;
    

    &:first-child {
      margin-top: 0;
      grid-template-columns: 120px 35px 220px 120px minmax(100px, auto) 110px 110px;

      &:before{
        content: '';
        display: block;
        position: absolute;
        left: -18px;
        top: 15px;
        height: 8px;
        width: 8px;
        border-radius: 50%;
        background-color: #ccc;
      }
      
    }
    &:nth-child(2) {
      grid-template-columns: 80px 300px 80px auto 400px;
    }
    &:nth-child(3) {
      grid-template-columns: 400px 350px 150px auto 150px;
    }

    > div {

      padding: 0 10px;

      &:nth-child(2) {padding-right: 0}
      &:nth-child(3) {padding-left: 5px;}
      
      > label {
        display: block;
        font-size: 7.5px;
        opacity: .5;
      }

      > div.scrolling-text {
        height: 50px;
        max-height: 50px;
        overflow-y: scroll;
      }

      input,
      textarea {
        width: 100%;
        max-width: 100%;
      }
      textarea {
        height: 50px;
      }

      .vdp-datepicker__calendar {
        right: 0;
      }

      .email-icon {
        display: inline-flex;
        height: 100%;
        width: 25px;
        align-items: center;
        
      }

      &.ellipses :where(a, span){
        display: inline-block;
        width: auto;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      
    }
  }

  .controls-row {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;

    button {
      margin: 0 10px;
    }
  }

  a {
    color: rgb(0,0,238);
  }

  button {
    appearance: none;
    display: inline-block;
    border: none;
    padding: 12px 20px;
    border-radius: 10px;
    cursor: pointer;

    &[disabled] {
      background: #ccc;
      color: #888;
      cursor: not-allowed;
    }
    &:not([disabled]) {
      background: #990000;
      color: white;

      &:hover{
        background: #bb0000;
      }
    }
  }

}


</style>