<template>
  <div class="container subpage">

    <div class="header-controls" ref="header-controls">

      <h2 v-if="!externalUser">Project Management</h2>
      <h2 v-else>Projects for {{externalUser.Account.Name}}</h2>

      <div class="timecard-params">

        

        <div>
          <select v-model="supplier">
            <option value="">Select Company</option>
            <option value="YORK">York Search Group</option>
            <option value="QAJAQ">Qajaq Northern Builders</option>
          </select>
        

        <!--div id="input-type">
          <label for="weekending"><input type="radio" id="weekending" value="weekending" v-model="period" />Weekending</label>
        </div-->

        
        <client-only>
          
          <Datepicker
              class="inline" 
              v-model="dateRange.from"
              
              format="yyyy-MM-dd"
              :use-utc="true"
              @input="storeDateRange" />

          <Datepicker
              class="inline" 
              v-model="dateRange.to"
              format="yyyy-MM-dd"
              :use-utc="true"
              @input="storeDateRange" />

          <button @click="getProjectsData" :disabled="!allFieldsFilled">Load Active Project Data</button>

          <button @click="clearFields">Reset</button>
          
        </client-only>

        </div>

        


          <!--div v-if="folders !== false">
            <select v-if="folders.length" v-model="folder">
              <option value="">Select Contractor</option>
              <option v-for="(folder, idx) in folders" :key="`folder-${idx}`" :value="folder.Id">{{ folder.Name }}</option>
            </select>
            <span v-else>No payroll data for given date found!</span>
          </div-->

          
        
      </div>


      

      

      <div v-if="projects">
        <h2>Active Projects Report</h2>
        
        <table id="projects-table">
          <thead>
            <tr>
              <th>PO No.</th>
              <th>Description</th>
              <th>Department</th>
              <th>Estimated Cost</th>
              <th>Budget</th>
              <th>Current Charges</th>
              <th>Balance</th>
            </tr>
          </thead>

          <tbody v-for="(project, idx) in projects" :key="`project-${idx}`">
            <tr>
              <td>{{project.PO__c}}</td>
              <td>{{project.Description__c}}</td>
              <td>{{project.Department__c}}</td>
              <td v-if="project.Estimates__r" class="currency"><a @click="project.showEstimates = !project.showEstimates">{{(project.Tax_Included__c || 0).toFixed(2)}}</a></td>
              <td v-else style="text-align: right">N/A</td>
              <td class="currency"><span>{{(project.Budget__c || 0).toFixed(2)}}</span></td>
              <td class="currency"><span>{{(project.Total_Charged__c || 0).toFixed(2)}}</span></td>
              <td class="currency"><span>{{(project.Balance__c || 0).toFixed(2)}}</span></td>
            </tr>
            <tr v-show="project.showEstimates">
              <td colspan="7" bgcolor="#eeeeee">

                <div style="text-align: center; margin: 10px;">
                  <b>Breakdown of Estimated Cost for {{project.Description__c}}</b>
                </div>

                <table class="estimates-table" v-if="project.Estimates__r">
                  <tr>
                    <th>Position</th>
                    <th>Hours</th>
                    <th>Charge</th>
                  </tr>
                  <tr v-for="(row, idx2) in project.Estimates__r.records" :key="`estimate-${idx}-row-${idx2}`">
                    <td style="width: 300px;">{{row.Name}}</td>
                    <td style="max-width: 8ch;">{{row.Hours__c}}</td>
                    <td class="currency"><span>{{(row.Estimated_Charge__c || 0).toFixed(2)}}</span></td>
                  </tr>
                </table>

                <div v-else>No estimate data available</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else-if="loadingProjects" style="margin: 20px 0">
        <Loader :message="`Importing Project Data for ${this.supplier} from ${moment.utc(dateRange.from).format('MMMM Do YYYY')} to ${moment.utc(dateRange.to).format('MMMM Do YYYY')}...`" />
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import Loader from '~/components/ui/Loader'
import {mapGetters} from 'vuex'

let defaultDates = (() => {
  let today = new Date()
  let jan1 = new Date(`${today.getUTCFullYear()}-01-01`)

  return {
    from: jan1,
    to: today
  }
})()


export default {
  components: {Loader},
  data () {
    return {
      supplier: '',
      dateRange: defaultDates,
      moment,
      projects: false,
      loadingProjects: false
    }
  },
  computed: {
    ...mapGetters(['externalUser']),
    allFieldsFilled () {
      return this.supplier && this.dateRange.from != '' && this.dateRange.to != ''
    }
  },
  created (){
    
  },
  mounted () {

    this.$axios.defaults.baseURL = this.$bus.servers[process.env.NODE_ENV].payroll
    
  },
  methods: {
    clearFields () {
      this.dateRange = {
        from: '',
        to: ''
      },
      this.supplier = ''
    },
    storeDateRange () {
      this.$store.commit('STORE_DATERANGE', this.dateRange)
    },
    async getProjectsData () {
      console.log('ok...')
      this.loadingProjects = true
      this.projects = false
      await this.$axios.post(`/payroll/projects/load`, {
        dateRange: this.dateRange,
        supplier: this.supplier
      })
      .then(({data}) => {
        this.projects = data
        this.projects.map(project => {
          this.$set(project, 'showEstimates', false)
          return project
        })
      })
      .catch(e => {
        console.log(e)
        this.$bus.$emit('toaster', {message: (e.response && e.response.data || e.message), status: 'error'})
      })
      .finally(() => this.loadingProjects = false)
    }
  }
}
</script>

<style scoped lang="scss">
h2 {
  margin: 20px 0;
}
#projects-table {
  
  font-size: .8em;
  
  border: 1px solid #ddd;
  border-collapse: collapse;
  
  th {
    text-align: left;

    background: #eee;

    &:nth-child(1) {width: max-content;}
    &:nth-child(2) {width: 300px;}
    &:nth-child(3) {width: max-content;}
    &:nth-child(4) {width: auto;}
    &:nth-child(5) {width: auto;}
    &:nth-child(6) {width: auto;}

    &:not(:last-child) {border-right: 1px solid #ccc;}
    border-collapse: collapse;

  }
  th, td {
    padding: 8px 20px 8px 10px;
    
  }
  td{
    border: 1px solid #ddd;
    border-collapse: separate;
    &.currency{
      text-align: right;
      padding-left: 20px;
      padding-right: 10px;
      > span:before{
        content: '$';
      }
    }
  }

  .estimates-table {
    border-collapse: collapse;
    margin: auto;
    th {
      background: #dddddd;
    }
    td {
      background: #ffffff;
    }
  }
}
</style>