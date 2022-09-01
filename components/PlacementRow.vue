<template>
  <tr class="placement-row" @click="activate" :class="rotationCommGroup" :active="active">

      <td class="controls">
        <PlacementControls 
          ref="placement-controls"
          v-if="active"
          :placement="placement"
        />
      </td>

      <td class="id">
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
        <a :href="sfLink(placement.Candidate.Id, 'Contact')" target="_blank">{{placement.Candidate.Name}}</a>
      </td>
      
      <td class="job-title ellipses">
        <span>{{placement.AVTRRT__Job_Title__c}}</span>
      </td>

      <td class="dept ellipses">
        <span>{{placement.Department__c || '&nbsp;'}}</span>
      </td>

      <td class="crew">
        <span>{{placement.Crew__c || '&nbsp;'}}</span>
      </td>

      <td class="shift">
        <span>{{placement.Shift__c || '&nbsp;'}}</span>
      </td>

      <td class="start-date">
        <span>{{moment.utc(placement.AVTRRT__Start_Date__c).format('YYYY/MM/DD')}}</span>
      </td>
      <td class="end-date">
        <span>{{moment.utc(placement.AVTRRT__End_Date__c).format('YYYY/MM/DD')}}</span>
      </td>

      <td class="location ellipses">
        <span>{{placement.Client_Location__c || '&nbsp;'}}</span>
      </td>

      <td class="flight ellipses">
        <span>{{placement.Flight__c || 'N/A'}}</span>
      </td>

      <td class="notes ellipses">
        <span>{{placement.Rotation_Communication__c || '&nbsp;'}}</span>
      </td>

      <td class="rot-comm ellipses">
        <span>{{placement.Additional_Notes__c || '&nbsp;'}}</span>
      </td>

      <td class="coverage ellipses">
        <span>{{placement.Coverage__c || '&nbsp;'}}</span>
      </td>

      <td class="airport ellipses">
        <span>{{placement.Client_Airport__c || '&nbsp;'}}</span>
      </td>

      <td class="po">
        <span>{{placement.PO__c || '&nbsp;'}}</span>
      </td>

      <td class="supplier">
        <span>{{placement.Supplier__c || '&nbsp;'}}</span>
      </td>

      <td class="deployment ellipses">
        <span>{{placement.Deployment_Forms__c || '&nbsp;'}}</span>
      </td>

      
      
    </tr>
    
    

</template>



<script>
import moment from 'moment'
import Icon from '~/components/ui/Icons'
import PlacementControls from '~/components/PlacementControls'
//import SalesforceIcon from '~/components/ui/SalesforceIcon'


export default {
  props: ['placement','active'],
  components: {
    Icon,
    PlacementControls
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
    
  },
  computed: {
    rotationCommGroup () {
      let lcRotComm = this.placement.Rotation_Communication__c && this.placement.Rotation_Communication__c.toLowerCase()
      if (/confirmation received/.test(lcRotComm)) return 'confirmed'
      else if (/cancel|cancelled/.test(lcRotComm)) return 'cancelled'
      else if (/declined|missed/.test(lcRotComm)) return 'declined'
      else if (/sent/.test(lcRotComm)) return 'sent'
      else return 'unknown'
    }
  },
  methods: {
    
    
    toggle () {
      this.$emit(this.active ? 'deactivate' : 'activate', this.placement)
    },
    activate () {
      if (!this.active) this.$emit('activate', this.placement)
    },
    deactivate () {
      console.log('deactivating')
      this.$emit('deactivate', this.placement)
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
  position: relative;
  

  &.confirmed {
    &:before {background-color: green;}
    background-color: rgba(rgb(74, 193, 5),0.2);
    &:hover {
      background-color: rgba(rgb(74, 193, 5),0.4);
    }
  }
  &.sent {
    &:before {background-color: orange;}
    background-color: rgba(orange, 0.2);
    &:hover {
      background-color: rgba(orange, 0.4);
    }
  } 
  &.declined {
    &:before {background-color: darkred;}
    background-color: darkred;
    animation: declinedAlert 1s linear infinite
  }
  &.cancelled {
    &:before {background-color: red;}
    background-color: rgba(red, .2);
    &:hover {
      background-color: rgba(red, .4);
    }
    text-decoration: line-through;
    span {opacity: .5;}
  }

  



  font-size: .8rem;

  cursor:pointer;
  

  //align-items: center;
  //grid-template-columns: 35px 35px minmax(150px, auto) 150px 150px 4ch 4ch 8ch 8ch 100px 140px 140px 140px 80px 13ch 10ch calc(150px + 20px);
  
  &:hover{
    background-color: #eee;
  }
  
  &[active] {
    color: white;
    &:hover {
      background-color: #666;
    }
    background-color: #666;
    animation: none;

    td {
      padding: 10px 5px 70px;
    }

    a {color: lightblue}
    
  }


    
    
    
  


  > td {

    margin-bottom: 1px;
    line-height: 1rem;
    vertical-align: middle;
    height: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: .9em;
    padding: 0 5px;

    label {display: none;}
    span {display: block;}


    &:last-child {
      padding-right: 20px;
    }
    &:first-child {
      padding-left: 20px;
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

}

@keyframes declinedAlert {
  0%, 100% {
    background-color: red;
  } 50% {
    background-color: rgba(red, 0.3);
  }
}

</style>