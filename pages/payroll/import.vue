<template>
  <div class="container subpage">

    <StatusBar :status="status" />
  
    <div class="header-controls" ref="header-controls">
      <h2>Quickbooks Contractor Import</h2>
    </div>

    <div class="main-container" ref="main-container" id="import-ui"  v-if="!networkDown">

      
      <div class="left-side">

        <ul class="options">
          <li>
            <h3>Select Company (required)</h3>
            <p>Create a request to sync current Quickbooks contractors. You should do this before performing an import. This up-to-date date will be used to determine if pending payees already exist in Quickbooks before importing them.</p>
            <select v-model="company">
              <option value="">Select Company</option>
              <option value="YORK">YORK Search Group</option>
              <option value="QAJAQ">QAJAQ Northern Builders</option>
            </select>
          </li>
          <!--li v-if="company">
            <h3>Step 1: Load QB ListID for Payroll Items and Service Items {{company}}</h3>
            <p>Create a request to sync Company File internal ID data. You should do this before doing anything else. Required to correlate payroll entries to correct items and services.</p>
            <div><button @click="startActivity" data-activity="import-qb-company-data" :disabled="working">Get QB Company File Data</button></div>
          </li-->
          <li v-if="company">
            <h3>Step 1: Retrieve Up-To-Date QuickBooks Payroll Data for {{company}}</h3>
            <p>Create a request to sync current Quickbooks contractors. You should do this before performing an import. This up-to-date date will be used to determine if pending payees already exist in Quickbooks before importing them.</p>
            <div><button @click="startActivity" data-activity="import-qb-data" :disabled="working">Get QuickBooks Data</button></div>
          </li>
          <li v-if="company">
            <h3>Step 2: Import QB Contractors to Salesforce for {{company}}</h3>
            <p>Compare QB contractor data to SF contractor data to identify new contractors, report on conflicts, and import to SF.</p>
            <div><label><input type="checkbox" v-model="sfImportOptions.refreshSFData"> Clear current SF data (re-download all SF Contact data)</label></div>
            <div><label><input type="checkbox" v-model="sfImportOptions.deletePrevious"> Clear SF records previously imported from QB <i>(unless Placement or Job Applicant associations exist)</i></label></div>
            <div v-if="sfImportOptions.deletePrevious">Select cutoff date for previous imports. Leave blank for all. <date-picker v-model="sfImportOptions.cutoffDate" /></div>
            <div><label><input type="checkbox" v-model="sfImportOptions.ignoreDuplicateEmailErrors"> Ignore duplicate Email errors</label></div>
            <div><label><input type="checkbox" v-model="sfImportOptions.ignoreEmailConflictErrors"> Ignore conflicting email errors</label></div>
            <div><button @click="startActivity" data-activity="import-to-sf" :disabled="working">Import/Update QB Contractors to SF</button></div>
          </li>
          <li v-if="company">
            <h3>Step 3: Retrieve Current Salesforce Contractors for Analysis and Reconciliation</h3>
            <p>Gets all current Placements from Salesforce for the given weekending to determine current Contractors. Compares SF data against QuickBooks data (from Step 1) to identify QB/SF data inconsistencies. Prepares new Contractors to import and reports any missing data in SF.</p>
            <div><label><input type="checkbox" v-model="qbImportOptions.vendors">Include New Vendor Requests</label></div>
            <p><Datepicker v-model="weekending" :disabled-dates="{days: [0,1,2,3,4,5]}" format="yyyy-MM-dd" /></p>
            <div><button @click="startActivity" data-activity="retrieve-sf-data" :disabled="working || !weekending || !(qbImportOptions.employees || qbImportOptions.vendors)">Get Salesforce Placement Data &amp; Build QBXML Requests</button></div>
          </li>
          <li v-if="company">
            <h3>Step 4: Execute Queued Modifications to Quickbooks Data</h3>
            <p>Activate QBXML requests for selected modifications:</p>
            <p>Pay Rate modifications: {{payMods}}; Bill Rate modifications: {{billMods}}</p>
            <div><button @click="startActivity" data-activity="execute-queued-qb-modifications" :disabled="working || true">Execute QB Modifications</button></div>
          </li>
          <li v-if="company">
            <h3>Step 5: Execute New QuickBooks Contractors Import</h3>
            <p>Activate EmployeeAdd requests for WebConnector import execution.</p>
            <div><button @click="startActivity" data-activity="execute-new-qb-contractors" :disabled="working">Execute New QB Contractor Imports</button></div>
          </li>
        </ul>

      </div>

      <div class="right-side-container">

        <div class="floating-console-buttons">
          <button @click="cancelActivity">Cancel Activity</button>
          <button @click="clearConsole">Clear Console</button>
        </div>

        <div class="right-side" ref="scrollingSide">

          <div class="console">

            <ul class="activities">
              <li v-if="!activities">Loading...</li>
              <li v-else-if="!activities.length">
                <span class="timestamp">
                  {{moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}}
                </span>
                <span class="description">
                  Waiting for command
                </span>
              </li>
              <li v-for="(activity, idx) in activities" :key="`activity-${idx}`" :class="activity.type">

                <div class="activity">

                  <span class="timestamp">
                    {{moment(activity.createdAt).format('YYYY-MM-DD HH:mm:ss')}}
                  </span>
                  <span class="description">
                    {{activity.description || 'No description'}}
                  </span>

                </div>

                <ul class="actions">

                  <li v-for="(action, idx2) in activity.actions" :key="`action-${idx2}-${idx}`">

                    <div class="action" :class="Object.keys(action)">
                      <span class="timestamp">
                        {{moment(action.createdAt).format('YYYY-MM-DD HH:mm:ss')}}
                      </span>
                      <span>
                        <span v-html="action.action"></span>&nbsp;
                        <span @click="toggleErrors($event, action)" v-if="action.errors" class="toggle-link">
                          <span v-if="action.showErrors">Hide Errors</span>
                          <span v-else>Show Errors</span>
                        </span>
                        <span @click="toggleDetails($event, action)" v-else-if="action.selectable" class="toggle-link">
                          <span v-if="action.showDetails">Hide Selections</span>
                          <span v-else>Show Selections</span>
                        </span>
                        <span @click="toggleDetails($event, action)" v-else-if="action.details" class="toggle-link">
                          <span v-if="action.showDetails">Hide Details</span>
                          <span v-else>Show Details</span>
                        </span>
                        <span @click="toggleModified($event, action)" v-if="action.modified" class="toggle-link">
                          <span v-if="action.showModified">Hide Modified</span>
                          <span v-else>Show Modified</span>
                        </span>
                      </span>
                    </div>

                    <ol class="errors" v-if="action.errors" v-show="action.showErrors">
                      <li v-for="(error, idx3) in action.errors" :key="`error-${idx}-${idx2}-${idx3}`">
                        <span v-html="error"></span>
                      </li>
                    </ol>

                    <ol class="modified" v-if="action.modified" v-show="action.showModified">
                      <li v-for="(mod, idx4) in action.modified" :key="`detail-${idx}-${idx2}-${idx4}`" :class="{queued: mod.queued}">
                        <span v-html="mod.description"></span> 
                        <a class="confirm-modification-link" @click="confirmMod" :data-type="mod.type" :data-id="mod.id" :data-fullname="mod.fullname">Confirm!</a>
                      </li>
                    </ol>

                    <ol class="details" v-if="action.details && !action.selectable" v-show="action.showDetails">
                      <li v-for="(detail, idx5) in action.details" :key="`detail-${idx}-${idx2}-${idx5}`">
                        <span v-html="detail"></span>
                      </li>
                    </ol>

                    <ol class="details" v-if="action.details && action.selectable" v-show="action.showDetails">
                      <li v-for="(detail, idx5) in action.details" :key="`detail-${idx}-${idx2}-${idx5}`">
                        <input type="checkbox" :id="`detail-cb-${idx}-${idx2}-${idx5}`" v-model="selectableItems[detail.id]" />
                        <span v-html="detail.content"></span>
                      </li>
                    </ol>

                  </li>
                </ul>
              </li>
            </ul>

          </div>
        </div>
      </div>
      
        
    

    </div>

    <div class="main-container" v-else>
      Network application unavailable.
    </div>


  </div>
</template>

<script>
import moment from 'moment'
import StatusBar from '~/components/ui/StatusBar'



export default {
  components: {StatusBar},
  data () {
    return {
      controller: process.client && new AbortController(),
      environment: process.env.NODE_ENV,
      process: process,
      latestActivityAt: new Date(),
      activities: [],
      activityPoller: false,
      activityCancelled: false,
      moment,
      company: '',
      weekending: '',
      working: false,
      status: {
        working: false,
        error: false,
        success: false
      },
      payMods: 0,
      billMods: 0,
      networkDown: false,
      sfImportOptions: {
        deletePrevious: false,
        refreshSFData: false,
        ignoreAccountNumberErrors: false,
        ignoreEmailConflictErrors: false,
        ignoreDuplicateEmailErrors: false,
        cutoffDate: ''
      },
      qbImportOptions: {
        employees: true,
        vendors: true
      },
      selectableItems: {}
      
    }
  },
  computed: {
   selectedItems () {
    return Object.entries(this.selectableItems).filter(el => !!el[1]).map(el => el[0])
   }
  },
  created () {
    
  },
  async mounted () {

    this.$axios.defaults.signal = this.controller.signal

    document.querySelector('.right-side').addEventListener('scroll', ($ev) => {
      console.log($ev.target.scrollTop)
    })

    //this.getActivity()//also initiates polling...
    console.log(this.environment, '<< environment')

    /*
    await this.$axios.post(`/confirm/modification`).then(({data}) => this.updateMods(data)).catch(e => {
      this.networkDown = true
      console.log(e)
    })
    */

  },
  beforeDestroy () {
    clearInterval(this.eventPoller)
  },
  methods: {
    consoleSelected () {
      console.log(this.selectableItems)
    },
    async confirmMod ($ev) {

      return alert('QB modifications are currently disabled!')

      //let {type, id} = $ev.target.dataset
      let vm = this

      console.log($ev.target.dataset, '<< modification dataset')

      await this.$axios.post(`/confirm/modification`, $ev.target.dataset).then(({data}) => {
        this.updateMods(data)
        $ev.target.parentNode.classList.add('queued')
      })

    },
    updateMods (data) {
      let {payMods, billMods} = data
      this.payMods = payMods
      this.billMods = billMods
    },
    toggleErrors ($ev, action) {
      //console.log('togglingErrors', action)
      action.showErrors = !action.showErrors
    },
    toggleModified ($ev, action) {
      //console.log('togglingErrors', action)
      action.showModified = !action.showModified
    },
    toggleDetails ($ev, action) {
      //console.log('togglingDetails', action)
      action.showDetails = !action.showDetails
    },
    async clearConsole () {
      await this.$axios.post(`/clear`)
      .then(() => {
        this.haltActivity({error: ''})
        this.activities = []
      })
      
    },
    async cancelActivity () {
      try{
        this.activities[this.activities.length - 1].actions.push({action: 'Cancelled.', error: true})
      } catch (e) {
        console.log(e)
        this.activities = [{description: 'Cancelling...', actions: [{action: 'Cancelled.', error: true}]}]
      }
      this.haltActivity({})
      this.activityCancelled = true
      this.controller.abort()
      
      await this.$axios.post(`/clear`)
      
      //this.haltActivity({error: 'Cancelled.'})
    },
    haltActivity (statusObj) {
      clearInterval(this.activityPoller)
      this.working = false
      this.status.working = false
      if (this.activityCancelled) return
      this.newActivity()
      this.status.error = statusObj.error || false
      this.status.success = statusObj.success || false
      this.status.working = false
    },
    getActivity () {

      //this.activities = []
      console.log('Initiating poller...')
      this.activityPoller = setInterval(this.newActivity, 1000)
      /*
      this.$axios.get('/activities')
      .then(({data}) => {
        console.log(data)

        if (data.length) this.latestActivityAt = data[0].updatedAt
        else this.latestActivityAt = new Date()
        this.activities = data

        
      })
      .catch(e => {
        console.log(e)
      })
      */
    },
    newActivity () {
      if (this.activityCancelled) return
      this.$axios.post('/activities', {after: this.latestActivityAt})
      .then(async ({data}) => {
        if (this.activityCancelled) return
        let _vm = this

        if (data.length) {

          this.latestActivityAt = data[0].updatedAt
          this.activities.push(data[0])
          this.activities = this.activities.filter((el, idx, self) => self.map(el => el._id).lastIndexOf(el._id) == idx)

          if (data[0].completed) {
            console.log('killing poller...')
            this.haltActivity({success: 'Success!'})
            await this.$axios.post(`/confirm/modification`).then(({data}) => this.updateMods(data))
          }

          

          if (data[0].selectable) {

            let selectableData = data[0].actions.find(el => el.selectable)

            if (selectableData) {
              try { 

                let selectableIds = selectableData.details.reduce((acc, el) => [...acc, el.id], [])

                this.selectableItems = {}
                for (let selectableId of selectableIds) this.$set(this.selectableItems, selectableId, false)

                console.log(this.selectableItems, '<< selectable items')
              } catch (e) {
                console.log(e)
              }
            }
          }

          for(let activity of this.activities) {
            activity.actions = activity.actions.map(_action => {
              if (_action.errors) _vm.$set(_action, 'showErrors', false)
              if (_action.details) _vm.$set(_action, 'showDetails', false)
              if (_action.modified) _vm.$set(_action, 'showModified', false)
              return _action
            })
          }

        }

        console.log(data)

      })
      .catch(e => {
        console.log(e)
        this.networkDown = true
        this.working = false
      })
    },

    async startActivity ($ev) {


      console.log('startActivity....')

      this.getActivity()
      this.activityCancelled = false
      this.working = true
      this.status.working = true

      let activity = $ev.target.dataset.activity

      switch (activity) {

       

        case 'import-qb-data':
        case 'import-qb-data-employee-only':

          console.log('Retrieving QB data...')

          return await this.$axios.post('/import/qb/data', {employeeOnly: activity.indexOf('employee-only') > -1})
          .then(({data}) => {
            if(this.activityCancelled) return
            //console.log(data)
            console.log('Request received...')
            //this.haltActivity({success: 'QuickBooks Employee Data Successfully Retrieved!'})
            //this.working = false
            //clearInterval(this.activityPoller)
            //this.newActivity()
          })
          .catch(e => {
            console.log(e)
            this.haltActivity({error: e.message})
            
          })

        case 'import-to-sf':

          console.log('Starting QB > SF Import')          

          return this.$axios.post('/salesforce/from/qb', {opts: this.sfImportOptions})
          .then(({data}) => {
            if(this.activityCancelled) return
            console.log(data)
            console.log('Request received...')
            //this.haltActivity({success: 'QuickBooks Data successfully Synced to Salesforce!'})
            //this.working = false
            //clearInterval(this.activityPoller)
            //this.newActivity()
          })
          .catch(e => {
            console.log(e)
            this.haltActivity({error: e.message})
          })


        case 'retrieve-sf-data':

          console.log('Retrieving SF data...')

          return this.$axios.post('/salesforce/import/data', {weekending: this.weekending, opts: this.qbImportOptions},{signal: this.controller})
          .then(({data}) => {
            if(this.activityCancelled) return
            console.log(data)
            console.log('Request received...')
            this.haltActivity({success:  'Current Salesforce Contractor Data Successfully Retrieved!'})
            //this.working = false
            //clearInterval(this.activityPoller)
            //this.newActivity(
          })
          .catch(e => {
            console.log(e)
            this.haltActivity({error: e.response && e.response.data || e.message})
          })

        case 'execute-queued-qb-modifications':

          console.log('Executing QB Modifications...')

          return await this.$axios.post('/quickbooks/modifications/execute')
          .then(({data}) => {
            if(this.activityCancelled) return
            console.log(data)
            console.log('Request received...')
            //this.haltActivity({success:  'QuickBooks MODIFY requests activated, waiting for Web Connector!'})
            //this.working = false
            //clearInterval(this.activityPoller)
            //this.newActivity()
          })
          .catch(e => {
            console.log(e)
            this.haltActivity({error: e.message})
          })

        case 'execute-new-qb-contractors':

          console.log('Executing new Contractor creation...')

          console.log(this.selectedItems)
          //this.haltActivity({success: 'just testing'})
          //return

          return await this.$axios.post('/quickbooks/additions/execute', {selected: this.selectedItems})
          .then(({data}) => {
            if(this.activityCancelled) return
            console.log(data)
            console.log('Request received...')
            //this.haltActivity({success:  'QuickBooks ADD requests activated, waiting for Web Connector!'})
            //this.working = false
            //clearInterval(this.activityPoller)
            //this.newActivity()
          })
          .catch(e => {
            console.log(e)
            this.haltActivity({error: e.message})
          })

      }
      
    }
    
    
  },

  watch: {
    'status.success' (val) {
      if (val) setTimeout(() => this.status.success = false, 5000)
    },
    'sfImportOptions.cutoffDate' (val) {
      if (!val) return
      this.sfImportOptions.cutoffDate.setHours(0)
      this.sfImportOptions.cutoffDate.setMinutes(0)
      this.sfImportOptions.cutoffDate.setSeconds(0)
      this.sfImportOptions.cutoffDate.setMilliseconds(0)

      console.log(this.sfImportOptions.cutoffDate)
    },
    weekending (val) {
      if (!val) return
      this.weekending.setHours(0)
      this.weekending.setMinutes(0)
      this.weekending.setSeconds(0)
      this.weekending.setMilliseconds(0)

      console.log(this.weekending)
    },
    activities (val) {

      setTimeout(() => {
        document.querySelector('.right-side').scrollTop = document.querySelector('.right-side').scrollHeight + 100
        console.log(document.querySelector('.right-side').scrollTop, '<< scroll top')
        console.log(document.querySelector('.right-side').scrollHeight, '<< scroll height')
      }, 100)
    },
    company (val) {

      let serverUrls = {
        development: {
          'YORK': 'http://localhost:8009',
          'QAJAQ': 'http://localhost:8009'
        },
        testing: {
          'YORK': 'https://qbwc.thebullittgroup.com/test/ysg',
          'QAJAQ': 'https://qbwc.thebullittgroup.com/test/qajaq'
        },
        production: {
          'YORK': 'https://qbwc.thebullittgroup.com/ysg',
          'QAJAQ': 'https://qbwc.thebullittgroup.com/qajaq'
        }
      }

      this.$axios.defaults.baseURL = serverUrls[this.environment][val || 'YORK']
      //alert(this.$axios.defaults.baseURL)
      console.log(this.$axios.defaults.baseURL, '<< server URL')

    }
  },
  selectableItems (val) {
    console.log(val, '<< selectedItems updated!')
  }
}
</script>

<style lang="scss">

.main-container {
  padding: 0 30px;
  height: 100%;
  position: relative;
}

#import-ui {

  width: 100%;
  position: relative;

  white-space: nowrap;
  vertical-align: top;
  height: inherit;
  max-height: 100%;

  .left-side {
    display: inline-block;
    vertical-align: top;
    white-space: normal;

    width: 50%;
    padding-right: 10px;

    .options {
      list-style: none;
      margin: 0;
      padding: 0;
      
      li {
        
        font-size: .9rem;
        margin-bottom: 20px;
        padding: 15px 20px;
        background: rgba(0,0,0,0.05);
        border-radius: 4px;
      }
    }
  }
  .right-side-container {
    width: 50%;
    position: relative;
    padding-left: 10px;
    display: inline-block;
    vertical-align: top;
    overflow: visible;

    .floating-console-buttons {
      position: absolute;
      top: -25px;
      text-align: right;
      width: 100%;
      left: 0;
    }

    .right-side {
      white-space: normal;
      position: relative;
      overflow: scroll;
      display: block;
      //padding-left: 10px;
      
      height: calc(100vh - 300px);
      .console {
        position: relative;
        width: 100%;
        //padding-top: 90%!important;
        background: #333;
        color: #ccc;
        padding: 20px;
        min-height: 100%;  
      }
    }
  }
}


.activities {
  list-style: none;
  margin: 0;
  padding: 0;
  > li {

    ul {list-style: none;}

    &:not(:last-child) {
      margin-bottom: 15px;
    }

    .activity {
      display: grid;
      grid-template-columns: 140px auto;

      .timestamp {
        
        
      }
      .description {
        
        
        font-weight: bold;
        color: white;
        
      }
    }

    .actions {
      margin: 0;
      padding: 0;
      li {
        .action {
          display: grid;
          grid-template-columns: 140px auto;

          &.errors,
          &.error {
            span:last-child{
              color: red;
            }
          }
          &.details,
          &.modified,
          &.warning {
            span:last-child{
              color: rgb(255, 174, 0);
            }
          }

          &.completed,
          &.success {
            span:last-child{
              color: greenyellow;
            }
          }
          &.completed {
            span:last-child{
              font-weight: bold
            }
          }

          &.info {
            span:last-child{
              color: #aaa;
            }
          }

          
      }

      ol.errors li,
      ol.details li,
      ol.modified li {
            color: #ccc;
            font-size: .8rem;
            line-height: 1.5;
            display: block;

            &.queued {
              a {
                display: none;
              }

              &:after {
                content: 'Queued!';
                color: rgb(174, 209, 1);
                font-weight: bold;
                display: inline-block;
              }
            }
          }
        }

    }
  }
}

.console a {
  color: yellow;
}

.timestamp {
font-size: .8rem;
        line-height: 1.2rem;
        color: #888;
}

.toggle-link {
  text-decoration: underline;
  cursor: pointer;
}

.confirm-modification-link{
  font-size: .6rem;
}

</style>
