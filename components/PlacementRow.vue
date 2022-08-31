<template>
<client-only>
  <tr class="placement-row" @click="activate" :class="[placement.Rotation_Communication__c && placement.Rotation_Communication__c.toLowerCase().split(' ').join('-') || 'None']" :active="active">
      <td class="id">
        <!--label>Placement #</label-->
        <a class="icon" :href="sfLink(placement.Id, 'AVTRRT__Placement__c')" target="_blank" :title="placement.Name">
          <Icon name="salesforce" />
        </a>
      </td>

      <td class="email">
        <a class="icon" :href="`mailto:${placement.Candidate.Email}`" target="_blank" :title="placement.Candidate.Email">
          <Icon name="email" />
        </a>
      </td>

      <td class="name ellipses">
        <label>Contractor Name</label>
        <a :href="sfLink(placement.Candidate.Id, 'Contact')" target="_blank">{{placement.Candidate.Name}}</a>
      </td>
      
      
      <td class="job-title ellipses">
        <label>Job Title</label>
        <span>{{placement.AVTRRT__Job_Title__c}}</span>
      </td>

      <td class="dept ellipses">
        <label>Department</label>
        <span>{{placement.Department__c || '&nbsp;'}}</span>
      </td>

      <!--td class="pay-rate">
        <label>Pay Rate</label>
        {{ payRateString(placement) }}
      </td-->

      <td class="crew">
        <label>Crew</label>
        <span>{{placement.Crew__c || '&nbsp;'}}</span>
      </td>

      <td class="shift">
        <label>Shift</label>
        <span>{{placement.Shift__c || '&nbsp;'}}</span>
      </td>

      <td class="start-date">
        <label>Inbound</label>
        <span>{{moment.utc(placement.AVTRRT__Start_Date__c).format('YYYY/MM/DD')}}</span>
      </td>
      <td class="end-date">
        <label>Outbound</label>
        <span>{{moment.utc(placement.AVTRRT__End_Date__c).format('YYYY/MM/DD')}}</span>
      </td>

      <td class="location ellipses">
        <label>Location</label>
        <span>{{placement.Client_Location__c || '&nbsp;'}}</span>
      </td>

      <td class="flight ellipses">
        <label>Flight</label>
        <span>{{placement.Flight__c || 'N/A'}}</span>
      </td>

      <td class="notes ellipses">
        <label>Notes</label>
        <span>{{placement.Additional_Notes__c || '&nbsp;'}}</span>
      </td>

      <td class="coverage ellipses">
        <label>Coverage</label>
        <span>{{placement.Coverage__c || '&nbsp;'}}</span>
      </td>

      <td class="airport ellipses">
        <label>Airport</label>
        <span>{{placement.Client_Airport__c || '&nbsp;'}}</span>
      </td>

      <td class="po">
        <label>PO</label>
        <span>{{placement.PO__c || '&nbsp;'}}</span>
      </td>

      <td class="supplier">
        <label>Supplier</label>
        <span>{{placement.Supplier__c || '&nbsp;'}}</span>
      </td>

      <td class="deployment ellipses">
        <label>Deployemnt</label>
        <span>{{placement.Deployment_Forms__c || '&nbsp;'}}</span>
      </td>



      
    </tr>
</client-only>
</template>



<script>
import moment from 'moment'
import Icon from '~/components/ui/Icons'
//import SalesforceIcon from '~/components/ui/SalesforceIcon'


export default {
  props: ['original-placement','active'],
  components: {
    Icon
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
    update () {
      this.$emit('update', this.placement)
    },
    extend () {
      this.$emit('extend', this.placement)
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
.placement-row{

  
  margin-left: 15px;

  display: table-row;
  table-layout: fixed;
  

  &.confirmation-received {
    &:before {background-color: green;}
    border-color: green;
  }
  &.rotation-information-sent {
    &:before {background-color: orange;}
    border-color: orange;
  } 
  &.rotation-declined {
    &:before {background-color: darkred;}
    border-color: darkred;
  }
  &.cancelled-hired-by-client {
    &:before:before {background-color: red;}
    border-color: red;
  }
  &.rotation-cancelled-by-client {
    &:before:first-child:before {background-color: red;}
    border-color: red;
  }

  &[active] {
    
    background: #ffff00;
  }



  font-size: .8rem;

  cursor:pointer;
  

  //align-items: center;
  //grid-template-columns: 35px 35px minmax(150px, auto) 150px 150px 4ch 4ch 8ch 8ch 100px 140px 140px 140px 80px 13ch 10ch calc(150px + 20px);
  
  &:hover{
    background-color: #eee;
  }


    
    
    
  


  > td {

    line-height: 1rem;
    vertical-align: middle;
    height: 100%;
    overflow: hidden;

    label {display: none;}
    span {display: block;}


    &:last-child {
      padding-right: 20px;
    }
    



    .vdp-datepicker__calendar {
      right: 0;
    }

    .icon {
      display: inline-flex;
      height: 100%;
      width: 20px;
      align-items: center;
    }

    &.ellipses :where(a, span){
      display: block;
      width: auto;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-right: 10px;
    }

    
  }
  
  /*
  .controls-row {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;

    button {
      margin: 0 10px;
    }
  }
  */

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