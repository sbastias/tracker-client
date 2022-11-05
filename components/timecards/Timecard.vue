<template>
  <li class="time-tracking-item" :id="row.Id" :class="{'do-not-sync': !row.folder || row.folder.doNotSync, externalUser}">

<div class="row" :title="payRate">
  <div class="candidate-name">
    <a :href="`https://thebullittgroup.my.salesforce.com/${row.AVTRRT__Contact_Candidate__c}`" target="_blank">{{row.AVTRRT__Contact_Candidate__r && row.AVTRRT__Contact_Candidate__r.LastName}}, {{row.AVTRRT__Contact_Candidate__r && row.AVTRRT__Contact_Candidate__r.FirstName}}</a>
  </div>
  <div class="candidate-email">
    {{row.AVTRRT__Contact_Candidate__r.Email}}
  </div>
  <div class="placement-account">
    {{row.AVTRRT__Employer__r && row.AVTRRT__Employer__r.Name}}
  </div>
</div>

<div class="row">
  <div class="placement-link">
    <a :href="`https://thebullittgroup.my.salesforce.com/${row.Id}`" target="_blank">{{row.Name}}</a>
  </div>
  <div class="placement-dept">
    {{row.Department__c || 'No Department'}}
  </div>
  <div class="placement-title">
    {{row.AVTRRT__Job_Title__c || 'No Job Title'}}
  </div>
  <div class="placement-shift">
    {{row.Shift__c || 'N/A'}}
  </div>

  <div class="placement-dates">
    <div class="placement-starts">
      {{moment(row.AVTRRT__Start_Date__c).format('YYYY-MM-DD')}}
    </div>
    <div class="placement-ends" v-if="row.AVTRRT__End_Date__c">
      {{moment(row.AVTRRT__End_Date__c).format('YYYY-MM-DD')}}
    </div>
    <div class="placement-ends" v-else>
      Permanent
    </div>
    <div class="pay-type">
      {{row.AVTRRT__Contact_Candidate__r.Pay_Type__c || 'NO PAY TYPE'}}
    </div>
  </div>
</div>



<div class="row">
  <div class="placement-supervisor">
    Supervisor: <a v-if="row.supervisor" :href="`https://thebullittgroup.my.salesforce.com/${row.supervisor.Id}`" target="_blank">{{row.supervisor.FirstName}} {{row.supervisor.LastName}}</a><span v-else>n/a</span> <span v-if="row.Crew__c">({{row.Crew__c}})</span>
  </div>
  <div class="placement-po">
    {{row.PO__c}}
  </div>
  
</div>

<div class="row">

  <div class="hours-container">

    <div id="tabs-and-sync">
      <ul class="type-tabs">
        <li v-for="_type in types" :key="`type-${_type}`" @click="activeType = _type" :class="{active: activeType == _type}">
          <span>
            {{ _type }}
          </span>
        </li>
      </ul>

      <span v-show="!externalUser">
        <span v-if="row.folder">
          <a :href="`https://thebullittgroup.my.salesforce.com/${row.folder.Id}`" target="_blank">Open Folder</a>&nbsp;
          <label class="sync-to-qb" @click="toggleSync">Sync to QB <input type="checkbox" :checked="!row.folder.doNotSync" readonly /> </label>
        </span>
        <span v-else>No Folder</span>
      </span>
    </div>

    <div class="week" :style="{display: billingType == 'NonBillable' && !row.shownonbillable && 'none' || 'block'}" v-for="billingType of ['Billable','NonBillable']" :key="billingType" :class="{'non-billable': billingType == 'NonBillable'}">

      <div class="weekly-container">

        <div class="daily-container" v-for="(dow, idx) of row.timeTracks[billingType].filter((el, idx, self) => self.map(el2 => el2.date).indexOf(el.date) == idx).map(el => el.date)" :key="`row-${row.Id}-${idx}`">

          <div 
            v-for="(dailyTrack, idx2) of row.timeTracks[billingType].filter(el => el.date == dow).sort((a,b) => types.indexOf(a.type) > types.indexOf(b.type) ? 1 : -1)" 
            :key="`track-${idx}-${idx2}`" 
            :class="[dailyTrack.type.toLowerCase(), billingType.toLowerCase(), {synced: dailyTrack.synced}]" 
            class="hours" 
            :id="dailyTrack.id"
            v-show="activeType == dailyTrack.type"
          >

            <label><span>{{moment.utc(dow).format('MM/DD ddd')}}</span></label>

            <div>
              <input type="number" :disabled="row.saving || externalUser" v-model="dailyTrack.hours" @input="hourChange($event, dailyTrack)" :class="{imported: !!dailyTrack.qb}" />
              <div v-if="dailyTrack.id" class="notes-cta" @click="toggleNote" :title="dailyTrack.defaultNotes">
                <NotesIcon :custom="dailyTrack.customNotes" v-show="!externalUser" />
              </div>
              <div class="notes" v-show="!!activeNoteId && activeNoteId == dailyTrack.id">
                <input type="text" class="notes-input" v-model="dailyTrack.notes" @input="startSaveTimer">
              </div>
            </div>
          </div>
        </div>

        <div class="daily-container">
          <div class="hours">
            <label><span>TOTAL</span></label>
            <div style="cursor: not-allowed;">
              <input type="number" readonly v-model="totals[activeType].hours" style="pointer-events: none;" />
            </div>
          </div>
        </div>
        
      </div>

      <div v-if="billingType == 'Billable'"><a @click="row.shownonbillable = !row.shownonbillable">{{row.shownonbillable && 'Hide' || 'Show'}} Non-Billable</a></div>

    </div>
  </div>
  <div class="placement-notes">
    <div class="heading">Additional Notes</div>
    <textarea v-model="row.Additional_Notes__c" @input="startSaveTimer"></textarea>
    <div class="totals-rows" v-show="!externalUser">
      <div>
        Pay Rate: ${{ payRate }} OT Rate: ${{ OTRate }}
      </div>
      <div>
        Reg: ${{totals.Regular.amount}} ({{totals.Regular.hours}}) 
        OT: ${{totals.OT.amount}}  ({{totals.OT.hours}}) 
        SB: ${{totals['Stand By'].amount}}  ({{totals['Stand By'].hours}}) 
      </div>
      <div>
        <b>TOTAL: ${{totals.total.amount}}({{totals.total.hours}}) </b>
      </div>
    </div>
  </div>
</div>


<div v-if="!!row.corrections && row.corrections.length">
  Placement has {{row.corrections.length}} corrections.
</div>



</li>
</template>

<script>
import moment from 'moment'
import {mapGetters} from 'vuex'
import NotesIcon from '~/components/NotesIcon'

export default {
  props: ['row','weekending'],
  components: {
    NotesIcon
  },
  data () {
    return {
      moment,
      activeNoteId: false,
      activeType: 'Regular',
      syncToQB: false,  
      types: ['Regular','OT','Stand By'],
      saveTimer: false
    }
  },
  mounted () {
    
  },
  created () {
    this.syncToQB = this.row.folder && !this.row.folder.doNotSync
  },
  computed: {
    ...mapGetters(['externalUser']),
    payRate () {

      return Number(this.row.Compensation__r && this.row.Compensation__r.Default_Pay_Rate__c || this.row.AVTRRT__Pay_Rate__c || 0).toFixed(2)

    },
    OTRate () {

      return Number(this.row.Compensation__r && this.row.Compensation__r.Default_OT_Pay_Rate__c || this.row.Overtime__Pay_Rate__c || 0).toFixed(2)

    },
    allTimeTracks () {
      let billingTypes = Object.keys(this.row.timeTracks)

      let allTimeTracks = []
      for (let billingType of billingTypes) {
        allTimeTracks.push(...this.row.timeTracks[billingType])
      }

      return allTimeTracks
    },
    totals () {

      let totals = {}
      let total = {hours: 0, amount: 0}
      let _vm = this

      for (let type of this.types) {

        let pay = (type => {
          switch (type) {
            case 'Regular':
              return this.payRate || 0
            case 'OT':
              return this.OTRate || 0
            default:
              return 0
          }
        })(type)

        //console.log(pay, '<< pay')
        totals[type] = {}

        totals[type].hours = this.allTimeTracks.filter(el => el.type == type).reduce((sum, el) => sum += Number(el.hours), 0)
        totals[type].amount = totals[type].hours * pay
        
        total.hours += totals[type].hours
        total.amount += totals[type].amount
      }

      totals.total = total
      
      return totals
    }
  },
  
  methods: {
    hourChange ($ev, track) {
      track.synced = false
      this.startSaveTimer()
    },
    toggleNote ($ev) {
      if (this.activeNoteId == $ev.target.closest('.hours').id) this.activeNoteId = false
      else this.activeNoteId = $ev.target.closest('.hours').id
    },
    async toggleSync (ev) {
      ev.preventDefault()

      return await this.$axios.post(`/payroll/folder/update-sync`, this.row.folder)
      .then(({data}) => this.row.folder.doNotSync = data.doNotSync)
      .catch(e => {
        console.log(e)
        alert('Toggle Sync Failed!')
        return false
      })
    },
    startSaveTimer() {
      //return console.log('starting timer...')

      this.row.unsaved = true
      //this.$set(this.unsaved, id, true)
      //this.$set(this.saved, id, false)
      clearTimeout(this.saveTimer)

      this.saveTimer = setTimeout(() => this.save(), 2000)
    },
    async save() {
      //console.log(row)
      //return

      this.row.saving = true
      this.row.Weekending = this.$parent.weekending

      await this.$axios
        .post(`/payroll/salesforce/update`, this.row, {
          headers: { 'Content-type': 'application/json' }
        })
        .then(({ data }) => {
          // data = {payrollFolderId, timeTrackObjs}
          //console.log(resp.data)
          if (!this.row.folder) this.$set(this.row, 'folder', { Id: data.payrollFolderId, doNotSync: true })
          this.row.unsaved = null
          this.row.saving = null
          this.row.saved = true

          console.log(data)

          let validTimeTracks = data.timeTrackObjs.filter(el => !!el)

          for (let timeTrack of validTimeTracks) {
            timeTrack.Id = timeTrack.id || timeTrack.Id

            let timeTracking = this.row.timeTracks[timeTrack.billingType].find(el => el.type == timeTrack.type && el.date == timeTrack.date)

            timeTracking.id = timeTrack.id
            timeTracking.notes = timeTrack.notes
            timeTracking.customNotes = timeTrack.customNotes

            if (timeTrack.qb) {
              let updateIdx = this.tally.toUpdate.map(el => el.Id).indexOf(timeTrack.id)
              let deleteIdx = this.tally.toDelete.map(el => el.Id).indexOf(timeTrack.id)

              //if (updateIdx > -1 && !timeTrack.op) this.tally.toUpdate.splice(updateIdx, 1)

              if (timeTrack.op == 'DELETE') {
                this.row.timeTracks[timeTrack.billingType][timeTrack.timeType].hours = '0'

                if (this.tally) {
                  if (updateIdx > -1) this.tally.toUpdate.splice(updateIdx, 1)
                  if (deleteIdx == -1) this.tally.toDelete.push(timeTrack)
                }
              } else if (this.tally && timeTrack.op == 'UPDATE') {
                if (deleteIdx > -1) this.tally.toDelete.splice(deleteIdx, 1)
                if (updateIdx == -1) this.tally.toUpdate.push(timeTrack)
              }
            } else {
              if (timeTrack.op == 'DELETE') {
                timeTracking.hours = ''
                timeTracking.notes = ''
                timeTracking.id = null
              }

              if (this.tally) {
                let createIdx = this.tally.toCreate.map(el => el.Id).indexOf(timeTrack.id)

                if (createIdx == -1 && timeTrack.op == 'CREATE') this.tally.toCreate.push(timeTrack)
                else if (createIdx > -1 && (timeTrack.op == 'DELETE' || !timeTrack.op)) this.tally.toCreate.splice(createIdx, 1)
              }
            }
          }

          setTimeout(() => (this.row.saved = null), 2000)
        })
        .catch(e => {
          this.row.unsaved = null
          this.row.saving = null
          console.log(e)
          alert(e.message)
        })
    }
    
  }

}
</script>


<style lang="scss">
.time-tracking-item{

transition: .3s ease-out;

&.externalUser {
  a {
    cursor: default;
    pointer-events: none;
  }
}

&.do-not-sync{
  background: #eee;
  transform: translateX(10px);
}
&.unsaved {
  background: rgb(255, 234, 171);
}
&.saved {
  background: rgb(185, 255, 193);
}
&.saving {
  background-color: rgb(255, 234, 171);
  background-image: url(/img/loading-bg.png);
  animation: saving .5s linear infinite;
  cursor: wait;
}
&.undefined {
  border-color: red;
  background: rgb(254, 232, 232);
}


padding: 20px;
border: 1px solid #ccc;
box-shadow: 3px 3px 5px -4px black;
border-radius: 5px;
margin-bottom: 10px;
background: #fff;

.row {
  display: grid;
  margin-bottom: 10px;
  grid-gap: 10px;

  &:nth-child(1) {//name, email
    width: 100%;
    grid-template-columns: max-content max-content auto;
    .candidate-name {
      font-weight: bold;
    }
    .placement-account {
      text-align: right;
    }
  }

  &:nth-child(2) {// placement ID, dept, title, dates
    width: 100%;
    grid-template-columns: max-content max-content max-content auto auto;
    font-size: .9rem;
    .placement-dates {
      display: flex;
      justify-content: flex-end;
      > div {
        margin-left: 20px;
      }
    }
  }

  &:nth-child(3) {// PO, supervisor
    width: 100%;
    grid-template-columns: 1fr 1fr;
    .placement-po {
      text-align: right;
    }
  }

  &:nth-child(4) {// hours
    width: 100%;
    grid-template-columns: 2fr 1fr;

    #tabs-and-sync {
      margin-bottom: 5px;
      display: flex;
      justify-content: space-between;

      .sync-to-qb,
      .sync-to-qb input {
        width: max-content;
      }
    }
    .type-tabs {
      display: block;
      margin: 0;
      padding: 0;
      list-style: none;
      height: 25px;
      
      position: relative;

      li {
        span {
          display: block;
          position: relative;
          height: 100%;
          width: 100%;
          clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 100%, 0 100%);
          background-image: linear-gradient(to right, #ccc, #aaa);
          padding: 5px 15px 5px 15px;
          white-space: nowrap;
          text-align: center;
          
        }
        display: inline-block;
        clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 100%, 0 100%);
        background: #ccc;
        border: 1px solid #ccc;
        border-bottom: 0;
        position: absolute;
        width: 95px;
        cursor: pointer;
        

        &:nth-child(1){left: 0;}
        &:nth-child(2){left: 85px;}
        &:nth-child(3){left: 170px;}
        
        &:not(:first-child) {
          z-index: 1;
        }
        &.active {
          z-index: 2;
          span {
            background: white;
          }
          font-weight: bold;
        }
      }
    }

    .heading {
      width: 100%;
      margin-bottom: 10px;
    }

    .hours-container {

      .heading {
        font-weight: bold;
      } 

      
      .week{
        margin-top: 5px;
      }
      

      display: grid;
      grid-template-columns: 100%;

      

      .weekly-container {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        grid-gap: 5px;
      }

      .daily-container {

        margin-bottom: 10px;
        &:last-child{ margin-bottom: 10px; }

        display: block;
        

        .hours {
          position: relative;

          

          label {position: absolute;line-height: 25px; top: 0; left: 11px; color: #999; font-size: 1rem; pointer-events: none;
            >span {
              font-size: .7rem;
              font-style: italic;
            }
          }
          input {
            padding: 25px 10px 10px;
            font-size: 20px;
            background: #eeeeee;
            border: 1px solid #888;
            text-align: right;

            &.notes-input {
              padding: 5px;
              font-size: 12px;
              
              text-align: left;
            }

            &.imported {
              background: white;
            }
          }

          &.synced {
            input {
              background: rgb(209, 250, 173);
            }
          }

          &.unbillable {
            input {
              background: #ddd;
              &.imported {background: #eee;}
            }
          }

          .notes {
            position: absolute;
            bottom: -15px;
            left: 22px;
            z-index: 4;
            box-shadow: 2px 2px 5px -1px black;
            width: 300%;
          }

          .notes-cta {
            z-index: 3;
            height: 25px;
            width: 25px;
            position: absolute;
            bottom: -5px;
            left: -3px;
          }
        }
      }
    
    }

    input, textarea {
      width: 100%;
    }
    
    
  }

}

.placement-notes{
  .heading {
    font-weight: bold;
  }
  grid-column: 2/3;
  
}

}

.totals-rows > div {
  margin: 5px 0;
}

.error-msg {
  color: red;
  font-weight: bold;
}
</style>