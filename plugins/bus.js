import Vue from 'vue'
import {mapGetters} from 'vuex'

export default ({store}) => {
  Vue.prototype.$bus = new Vue({
    name: 'Bus',
    template: '<div>BUS IS HERE!</div',
    created () {
      if (process.client) {
        window.addEventListener('resize',() => this.$emit('resize'))
      }
    },
    beforeDestroy () {
      if (process.client) {
        window.removeEventListener('resize')
      }
    },
    data () {
      return {
        metadata: false,
        accounts: false,
        users: false,
        fullscreen: false,
        candidateStatuses: [
          "Qualifying",
          "Qualified/No Red Flags",
          "Pre-Employment Underway",
          "Available ASAP",
          "Stand By",
          "Current Field Staffer",
          "Ex Field Staffer",
          "Needs 1 week Notice",
          "Needs 2 Weeks",
          "QUIT - No Notice",
          "QUIT - With Notice",
          "Quit - TOOK LAYOFF",
          "QUIT - Temp Leave",
          "Not Relevant Now",
          "Placed!",
          "NOT BIM",
          "Hired by Another Firm",
          "Do Not Use",
          "Seeking Update",
          "FF - Seeking Update",
          "Active",
          "Inactive",
          "Candidate to Call Dave",
          "No Call Back re BIM",
          "Safety Questions Completed",
          "Sent Message/Available",
          "Send Pre-Submission Form-Just for Client List (sends email)",
          "Pre-Submission Form SENT",
          "Ask for a Review (sends email)",
          "Send Questionnaire to Treaty Holders (sends email)",
          "INUK Candidate to call Dave",
          "BIM Questionnnaire",
          "BIM Create Deployment Form (automation)",
          "Heads Up - Client Converting",
          "Conversion Process Started",
          "Non-Responsive",
          "Deceased",
          "Q2 2021 - Needs more Money",
          "Anti-Vaxx",
          "Vax-Hesitant",
          "OFF on WSCC",
          "INUK Candidate to Call QAJAQ",
          "OFF ON MEDICAL",
          "Unknown"
        ]
      }
    },
    computed: {
      ...mapGetters(['storedSupplier']),
      servers () {
        return {
          development: {
            payroll: 'http://localhost:8009',
            tracker: 'http://localhost:8011'
          },
          testing: {
            payroll: `https://qbwc.thebullittgroup.com/test/${store.getters.storedSupplier == 'QAJAQ' && 'qajaq' || 'ysg'}/`,
            tracker: 'https://starla-server.thebullittgroup.com'
          },
          production: {
            payroll: `https://qbwc.thebullittgroup.com/${store.getters.storedSupplier == 'QAJAQ' && 'qajaq' || 'ysg'}/`,
            tracker: 'https://starla-server.thebullittgroup.com'
          }
        }
      }
    },
    methods: {
      toggleFullscreen () {
        this.fullscreen = !this.fullscreen
      },
      log () {
        //return false
        console.log(JSON.parse(JSON.stringify(arguments)))
      }
    }
  })
}