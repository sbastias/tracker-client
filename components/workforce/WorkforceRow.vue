<template>
<tbody class="contact-container" :saving="saving" :active="active">

  <tr class="contact-row">

      <td class="name ellipses">
        <div>
          <a :href="sfLink(contact.Id, 'Contact')" target="_blank" v-if="contact.FirstName != 'Open'">{{contact.FirstName}} {{contact.LastName}}</a>
          <span style="font-style: italic" v-else>{{contact.FirstName}} {{contact.LastName}}</span>
        </div>
      </td>
      
      <td class="ellipses" v-for="(column, idx) in activeColumns.slice(1)" :key="`field-column-${idx}`" :class="[column.field]" :title="contact[column.field]">
        <div v-if="!column.editable">
          <a v-if="column.field == 'Email'" :href="`mailto:${ contact[column.field] }`">{{contact[column.field]}}</a>
          <div v-else-if="column.field == 'LastModifiedDate'">{{moment.utc(contact[column.field]).format('YYYY-MM-DD')}}</div>
          <div v-else>{{contact[column.field] || '&nbsp;'}}</div>
        </div>
        <div v-else class="editable" :class="{editing: editing == column.field}">
          <div v-if="editing == column.field">
            <input 
              v-if="column.field == 'Last_Update_Status__c'"
              id="editing-field"
              v-model="contact[column.field]"
              @keyup.esc="editing = false"
              @keyup.enter="save"
             />
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
              v-if="column.field == 'Handler'"
              id="editing-field"
              v-model="contact.Handler__c"
              @keyup.esc="editing = false"
              @change="save"
            >
              <option v-for="(user, idx) in $bus.users" :key="`user-opt-${idx}`" :value="user.Id">{{user.FirstName}} {{user.LastName}}</option>
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
      this.editing = $ev.target.dataset.field
      //console.log('Editing', this.editing, '...')
      this.$nextTick(() => document.getElementById('editing-field').focus())
    },
    async save () {

      this.saving = true

      let fieldToSave = this.editing == 'Handler' && 'Handler__c' || this.editing

      await this.$axios.post(`/workforce/update`,{
        Id: this.contact.Id,
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

  &[saving] {
    cursor:wait;
    * {cursor: wait;}
    opacity: .5;
  }

  margin-left: 15px;
  font-size: .8rem;
  
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




  .contact-row{

    background: transparent;
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
      
     

      > div {


        vertical-align: middle;
        height: 100%;
        width: 100%;

        &:not(.editing) {
          > a, > div {
            width: 100%;
            text-overflow: ellipsis;
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