<template>
  <div>

    <div>
      <button @click="getProjectsData">Load Active Project Data</button>
    </div>

    <div v-if="projects">
      <h2>Active Projects Report</h2>
      
      <table id="projects-table">
        <thead>
          <tr>
            <th>PO No.</th>
            <th>Description</th>
            <th>Department</th>
            <th>Budget</th>
            <th>Charged</th>
            <th>Balance</th>
          </tr>
        </thead>

        <tbody v-for="(project, idx) in projects" :key="`project-${idx}`">
          <tr>
            <td>{{project.PO__c}}</td>
            <td>{{project.Description__c}}</td>
            <td>{{project.Department__c}}</td>
            <td class="currency"><span>{{project.Budget__c.toFixed(2)}}</span></td>
            <td class="currency"><span>{{(project.Total_Charged__c || 0).toFixed(2)}}</span></td>
            <td class="currency"><span>{{project.Balance__c.toFixed(2)}}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else-if="loadingProjects" style="margin: 20px 0">
      <Loader :message="`Importing Project Data for ${this.supplier} ${moment.utc(weekendingRaw).format('MMMM Do')} weekending...`" />
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import Loader from '~/components/ui/Loader'

export default {
  props: ['weekendingRaw','supplier'],
  components: {Loader},
  data () {
    return {
      moment,
      projects: false,
      loadingProjects: false
    }
  },
  created (){
    
  },
  mounted () {

    this.$axios.defaults.baseURL = this.$bus.servers[process.env.NODE_ENV].payroll
    
  },
  methods: {
    async getProjectsData () {
      console.log('ok...')
      this.loadingProjects = true
      this.projects = false
      await this.$axios.post(`/payroll/projects/load`, {
        weekending: this.weekendingRaw,
        supplier: this.supplier
      })
      .then(({data}) => {
        this.projects = data
      })
      .catch(e => {
        console.log(e)
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
}
</style>