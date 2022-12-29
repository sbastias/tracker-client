<template>
<tbody class="contact-container" :saving="saving" :active="active" :class="{highlighted, hasPending: contact.hasPending, externalUser: $parent.externalUser}">

  <tr class="contact-row">

      <td class="documents" :style="{width: activeColumns[0].width + 'px','max-width': activeColumns[0].width + 'px', padding: 0}">
        <div @click="$emit('documents', contact)" :style="{height: (activeColumns[0].width - 5) + 'px', 'max-height': (activeColumns[0].width - 5) + 'px', position: 'relative'}">
          <Icon name="documents" :width="activeColumns[0].width + 'px'" />
        </div>
      </td>

      <td class="name ellipses" :style="{width: activeColumns[1].width + 'px'}">
        <div>
          <a :href="sfLink(contact.Id, 'Contact')" target="_blank" v-if="!$parent.externalUser && contact.FirstName != 'Open'">{{contact.FirstName}} {{contact.LastName}}</a>
          <span style="white-space: nowrap;" v-else>{{contact.FirstName}} {{contact.LastName}}</span>
        </div>
      </td>
      
      <td class="ellipses" v-for="(column, idx) in activeColumns.slice(2)" :key="`field-column-${idx}`" :class="[column.field]" :title="contact[column.field]">
        <div v-if="!column.editable">
          <a v-if="column.field == 'Email'" :href="`mailto:${ contact[column.field] }`">{{contact[column.field]}}</a>
          <div v-else-if="column.field == 'LastModifiedDate'">{{moment.utc(contact[column.field]).format('YYYY-MM-DD')}}</div>
          <div v-else>{{contact[column.field] || '&nbsp;'}}</div>
        </div>
        <div v-else class="editable" :class="{editing: editing == column.field}">
          <div v-if="editing == column.field">
            <select 
              v-if="column.field == 'Last_Update_Status__c'"
              id="editing-field"
              v-model="contact[column.field]"
              @keyup.esc="editing = false"
              @change="save"
             >
              <option v-for="(status, idx) in $bus.updateStatuses" :key="`update-status-opt-${idx}`" :value="status">{{status}}</option>
             </select>

            <datepicker 
              v-if="column.field == 'Last_Update_Date__c'"
              id="editing-field"
              :format="'yyyy-MM-dd'"
              v-model="contact[column.field]" 
              @blur="editing = false"
              @input="save" 
              :use-utc="true"
            />
            <select 
              v-if="column.field == 'AVTRRT__Candidate_Status__c'"
              id="editing-field"
              v-model="contact[column.field]"
              @keyup.esc="editing = false"
              @change="save"
            >
              <option v-for="(status, idx) in $bus.candidateStatuses" :key="`status-opt-${idx}`" :value="status">{{status}}</option>
            </select>
            <select 
              v-if="column.field == 'Handler' && !$parent.externalUser"
              id="editing-field"
              v-model="contact.Handler__c"
              @keyup.esc="editing = false"
              @change="save"
            >
              <option v-for="(user, idx) in $bus.users" :key="`user-opt-${idx}`" :value="user.Id">{{user.FirstName}} {{user.LastName}}</option>
            </select>
            <select 
              v-if="column.field == 'AVTRRT__Stage__c'"
              id="editing-field"
              v-model="contact.AVTRRT__Stage__c"
              @keyup.esc="editing = false"
              @change="save"
            >
              <option v-for="(stage, idx) in $bus.metadata.find(el => el.fullName == 'AVTRRT__Job_Applicant__c').fields.find(el => el.fullName == 'AVTRRT__Stage__c').valueSet.valueSetDefinition.value" :key="`stage-opt-${idx}`" :value="stage.label">{{stage.fullName}}</option>
            </select>

          </div>

          <div v-else :data-field="column.field" @click="edit">{{contact[column.field] || '&nbsp;'}}</div>
          
        </div>
      </td>

    </tr>
    
</tbody>

</template>



<script>
import moment from 'moment'
import Icon from '~/components/ui/Icons'
import ContactControls from '~/components/ContactControls'


export default {
  props: ['original-contact','active','activeColumns','width'],
  components: {
    Icon,
    ContactControls,
  },
  data () {
    return {
      highlighted: false,
      moment,
      mode: 'classic',
      editing: false,
      edited: false,
      contact: this.originalContact,
      saving: false
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
    
    
    activeFields () {
      return this.activeColumns.map(el => el.field).filter(el => !!el)
    }
  },
  methods: {
    edit ($ev) {

      if ($ev.target.dataset.field == 'AVTRRT__Stage__c' && !this.contact.jobApplicantId) return alert('Cannot edit this field for Current Field Staffer')

      this.editing = $ev.target.dataset.field
      //console.log('Editing', this.editing, '...')
      this.$nextTick(() => document.getElementById('editing-field').focus())
    },
    async save () {

      this.saving = true

      let fieldToSave = this.editing == 'Handler' && 'Handler__c' || this.editing

      let Id = this.contact.Id
      if (fieldToSave == 'AVTRRT__Stage__c') Id = this.contact.jobApplicantId

      await this.$axios.post(`/workforce/update`,{
        Id,
        [fieldToSave]: this.contact[fieldToSave]
      })
      .then(({data}) => {
        if (this.editing == 'Handler') {
          let user = this.$bus.users.find(el => el.Id == this.contact.Handler__c)
          this.contact.Handler = `${user.FirstName} ${user.LastName}`
        }
        if (this.editing == 'Last_Update_Date__c') {
          this.contact.Last_Update_Date__c = this.contact.Last_Update_Date__c.toISOString().substring(0,10)
        }
        this.$bus.$emit('toaster',{status: 'success', message: 'Candidate Updated!'})
      })
      .catch(e => {
        let {message, stack} = e.response.data
        this.$bus.$emit('toaster',{status: 'error', message})
        console.log(stack)
      })
      .finally(() => {
        this.editing = false
        this.saving = false
      })
      
    },
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
    }
  },
  watch: {
    editing (val) {
      if (val) window.addEventListener('keyup', (e) => {if (e.key == 'Escape') this.editing = false})
      else window.removeEventListener('keyup', (e) => {if (e.key == 'Escape') this.editing = false})
    }
  }
}
</script>

<style lang="scss">
.contact-container{

  margin-left: 15px;
  font-size: .8rem;

  tr{
    background: inherit;
  }
  td:where(.documents,.name,.Email,.LastModifiedDate,.Primary_Occupation__c){
    position: sticky;
    background: inherit;
    z-index: 3!important;
  }


  td.documents{left: 0; overflow: hidden;}
  td.name{left: 25px; overflow: hidden;}
  td.Email{left: calc(25px + 200px)}
  td.LastModifiedDate{left: calc(25px + 200px + 200px)}
  td.Primary_Occupation__c{left: calc(25px + 200px + 200px + 100px)}
  &.externalUser {
    td.documents{left: 0}
    td.name{left: 25px}
    td.Email{left: calc(25px + 200px); display: none;}
    td.LastModifiedDate{left: calc(25px + 200px);}
    td.Primary_Occupation__c{left: calc(25px + 200px + 100px)}
  }


  &[saving] {
    cursor:wait;
    * {cursor: wait;}
    opacity: .5;
  }


  
  //DEFAULT YELLOW
  
  background-color: #ffffcc;
  &:hover {
    background-color: #ffff55;
  }

  &.highlighted {
    background-color: #e0ffcc;
    &:hover {
      background-color: #c2ff99;
    } 
  }

  &.hasPending {
    background: url(~/assets/img/flashing-blue.gif);
    background-size: cover;
  }




  .contact-row{

    
    display: table-row;
    table-layout: fixed;
    position: relative;


  


    > td {

      margin-bottom: 1px;
      line-height: 1rem;
      &:last-child {
        padding-right: 20px;
      }
      &:first-child {
        //padding-left: 20px;
      }

      &.ellipses {
        >div:not(.editing)>:where(a,div){
          text-overflow: ellipsis;
        }
      }
      
     

      > div {


        vertical-align: middle;
        height: 100%;
        width: 100%;

        &:not(.editing) {
          > a, > div {
            width: 100%;
            //text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            font-size: .9em;
            padding: 0 5px;
          }
        }

        label {display: none;}
        

        .icon {
          display: inline-flex;
          height: 100%;
          width: 20px;
          align-items: center;
        }

        

        &.editable {

          padding-right: 15px;
          cursor: pointer;

          input, select {
            width: 100%;
          }

          &:not(.editing) {

            &:hover {
              background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTAuNDcgMTEwLjQ3Ij48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik03MS45OCwzLjQyTDQuNTIsNzAuODgsMCwxMTAuNDdsMzkuNTktNC41MkwxMDcuMDUsMzguNDljNC41Ny00LjU3LDQuNTctMTEuOTksMC0xNi41Nkw4OC41NCwzLjQyYy00LjU3LTQuNTctMTEuOTktNC41Ny0xNi41NiwwWk01Ljc5LDk1LjA4bDIuMzQtMjAuNDZjNC4xNSwxLjgsMTIuNDMsNi4yOCwxMi40MywxMy4zMXYyLjEyczIuMTItLjEyLDIuMTItLjEyYzQuNzgtLjI4LDkuODYsMy4xMSwxMi40MSw2LjYsMS40NywyLjAxLDIuMTQsNC4wMSwxLjk3LDUuNjlsLTIxLjY1LDIuNDdjLS42OS0xLjQtMS45My0zLjQyLTQuMDYtNS41NXMtNC4xNS0zLjM3LTUuNTUtNC4wNlptMTguNjItOS4xM2MtMS4yMy04LjAzLTkuNzYtMTIuODQtMTQuNC0xNC44OUw2MS4wMiwyMC4wNGwyOS40MSwyOS40MS00OS43LDQ5LjdjLS40Mi0xLjY2LTEuMjItMy4zNS0yLjQyLTQuOTktMi44Ny0zLjkzLTguMTMtNy43Ni0xMy45MS04LjIxWk02My44NSwxNy4yMWwyLjEyLTIuMTIsMjkuNDEsMjkuNDEtMi4xMiwyLjEyLTI5LjQxLTI5LjQxWm00MC4zNyw3LjU1YzMuMDEsMy4wMSwzLDcuOSwwLDEwLjlsLTYuMDEsNi4wMS0yOS40MS0yOS40MSw2LjAxLTYuMDFjMy4wMS0zLjAxLDcuOS0zLjAxLDEwLjksMGwxOC41MSwxOC41MVoiLz48L3N2Zz4=');
              background-repeat: no-repeat;
              background-size: auto 80%;
              background-position: 100% 50%;
            }
          }
          
        }

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