<template>
<tbody class="placement-container" :class="[{internalStatus, mismatchedRates: placement.candidateCompensation != placement.jobApplicantPayRate},rotationCommGroup]" :active="active" @click="toggleRow">

  <tr class="placement-row">
      <td class="id">
        <a class="icon" :href="sfLink(placement.Id, 'AVTRRT__Placement__c')" target="_blank" :title="placement.Name">
          <Icon name="salesforce" />
        </a>
      </td>

      <td class="email">
        <a class="icon" :href="`mailto:${placement.AVTRRT__Contact_Candidate__r.Email}`" target="_blank" :title="placement.AVTRRT__Contact_Candidate__r.Email" v-if="placement.AVTRRT__Contact_Candidate__r.Email">
          <Icon name="email" />
        </a>
      </td>

      <td class="name ellipses">
        <a :href="sfLink(placement.AVTRRT__Contact_Candidate__r.Id, 'Contact')" target="_blank" v-if="placement.AVTRRT__Contact_Candidate__r.FirstName != 'Open'">{{placement.AVTRRT__Contact_Candidate__r.FirstName}} {{placement.AVTRRT__Contact_Candidate__r.LastName}}</a>
        <span style="font-style: italic" v-else>{{placement.AVTRRT__Contact_Candidate__r.FirstName}} {{placement.AVTRRT__Contact_Candidate__r.LastName}}</span>
      </td>
      
      <td class="ellipses" v-for="(field, idx) in activeFields" :key="`field-column-${idx}`" :class="field">
        <span>{{placement[field] || '&nbsp;'}}</span>
      </td>      
    </tr>

    <tr class="placement-controls" :style="{width}" v-if="active">
      <td :colspan="activeFields.length + 3">
        
          <PlacementControls 
            ref="placement-controls"
            v-if="type == 'placement'"
            :placement="placement"
          />
          <OpenOrderControls 
            ref="open-order-controls"
            v-if="type == 'open-order'"
            :placement="placement"
          />
        
      </td>
    </tr>
    
</tbody>

</template>



<script>
import moment from 'moment'
import Icon from '~/components/ui/Icons'
import PlacementControls from '~/components/PlacementControls'
import OpenOrderControls from '~/components/OpenOrderControls'
//import SalesforceIcon from '~/components/ui/SalesforceIcon'


export default {
  props: ['placement','active','activeColumns','width'],
  components: {
    Icon,
    PlacementControls,
    OpenOrderControls
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
    this.$bus.$on('resize', this.resizeStuff)
  },
  beforeDestroy () {
    this.$bus.$off('resize')
  },
  mounted () {
    this.resizeStuff()
  },
  computed: {
    internalStatus () {
      return !!this.placement.Internal_Status__c
    },
    rotationCommGroup () {
      let lcRotComm = this.placement.Rotation_Communication__c && this.placement.Rotation_Communication__c.toLowerCase()
      let openOrder = this.placement.AVTRRT__Contact_Candidate__r.FirstName == 'Open'
      if (/confirmation received/.test(lcRotComm)) return 'confirmed'
      else if (/cancel|cancelled|missed/.test(lcRotComm)) return 'cancelled'
      else if (/declined/.test(lcRotComm)) return 'declined'
      else if (/sent/.test(lcRotComm)) return 'sent'
      else if (openOrder) return 'open'
      else return 'unknown'
    },
    type () {
      let openOrder = this.placement.AVTRRT__Contact_Candidate__r.FirstName == 'Open'

      return openOrder ? 'open-order' : 'placement'
    },
    activeFields () {
      return this.activeColumns.map(el => el.field).filter(el => !!el)
    }
  },
  methods: {
    resizeStuff () {
      
    },
    toggle () {
      this.$emit(this.active ? 'deactivate' : 'activate', this.placement)
    },
    toggleRow () {
      this.$emit('toggle-row', this.placement)
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
        if (placement.AVTRRT__Contact_Candidate__r.Pay_Rate_Adjustment__c) {
          payRate += Number(placement.AVTRRT__Contact_Candidate__r.Pay_Rate_Adjustment__c)
          adjustment = ` (+${ placement.AVTRRT__Contact_Candidate__r.Pay_Rate_Adjustment__c.toFixed(2) })`
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
.placement-container{

  margin-left: 15px;
  font-size: .8rem;
  cursor:pointer;
  
  &.mismatchedRates {
    //font-weight: bold;
  }
  
  //DEFAULT YELLOW
  &:before {background-color: lightyellow;}
  background-color: rgba(yellow, 0.2);
  &:hover {
    background-color: rgba(yellow, 0.4);
  }

  &.internalStatus {
    &:before {background-color: rgb(255, 122, 74);}
    background-color: rgb(255, 122, 74);
    &:hover {
      background-color: rgb(255, 122, 74);
    }
  }
  &:not(.internalStatus) {
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
    &.open {
      &:before {background-color: lightyellow;}
      background-color: rgba(yellow, 0.2);
      &:hover {
        background-color: rgba(yellow, 0.4);
      }
    } 
    &.declined {
      &:before {background-color: rgba(255, 68, 68, .5);}
      background-color: rgba(255, 68, 68, .5);
      background-image: repeating-linear-gradient(60deg, red 1px, transparent 2px, transparent 9px, red 1px);
      animation: declinedAlert 1s linear infinite;
      &:hover{
        background-color: pink;
        background-image: none;
      }
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
  }




  .placement-row{

    background: transparent;
    display: table-row;
    table-layout: fixed;
    position: relative;


  


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
  
  }
  

  .placement-controls {
    
    display: table;
    margin-top: -1px;
    position: sticky;
    left: 0;
    background: inherit;
    padding: 5px 0 15px;

    #active-controls {
      position: relative;
      right: 0;
      height: 70px;
    }
  

  
  }
  
  



  
  

  //align-items: center;
  //grid-template-columns: 35px 35px minmax(150px, auto) 150px 150px 4ch 4ch 8ch 8ch 100px 140px 140px 140px 80px 13ch 10ch calc(150px + 20px);
  
  &:hover{
    background-color: #eee;
  }

  a {
    color: rgb(0,0,238);
    pointer-events: none;
  }
  
  &[active] {

    .placement-row td {padding-top: 10px;}

    a{pointer-events: all;}
    color: white;
    &:hover {
      background-color: #666!important;
    }
    background-color: #666!important;
    animation: none;
    a {color: lightblue}
    
  }


    
    
    
  

  

}

@keyframes declinedAlert {
  0%, 100% {
    background-position: 0 center;
  } 100% {
    background-position: -10px center;
  }
}


</style>