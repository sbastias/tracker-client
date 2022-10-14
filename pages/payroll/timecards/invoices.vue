<template>
  <div>

    <h1>Invoice Generator</h1>

    <ol>

      <li>
        Invoice By: 
        <label for="invoice-by-date"><input type="radio" id="invoice-by-date" v-model="invoiceBy" value="date" /> Date</label>
        <label for="invoice-by-number"><input type="radio" id="invoice-by-number" v-model="invoiceBy" value="number" /> Number</label>
      </li>

      <template v-if="invoiceBy">

        <li>
          Start WebConnector for {{supplier}}
        </li>

        <template v-if="invoiceBy == 'date'">
        
        <li>
          Load QuickBooks Data for Active Clients for the week of {{weekending}}
          <div>
            <button @click="loadActiveClients" :disabled="waitingForClients">Load Active Clients</button>
          </div>
          <div v-if="waitingForClients">
            Request pending for QuickBooks...
          </div>
          
        </li>
        
        <li v-if="activeClients">
          <select v-model="clientToInvoice" :disabled="!activeClients">
            
            <option value="">Select client to invoice</option>
            <option v-for="client in activeClients" :key="client.ListID" :value="client.ListID">{{client.FullName}}</option>

          </select>
        </li>

        
        <li v-if="clientToInvoice">

          <client-only>
            <Datepicker
                v-model="invoiceDate"
                :disabled-dates="{
                  days: []
                }"
                format="yyyy-MM-dd"
                :use-utc="true" />
          </client-only>

        </li>

        
        
      </template>

      <template v-if="invoiceBy == 'number'">
        
        <li>
          Enter Invoice Number
          <div>
            <input type="number" v-model="invoiceNumber">
          </div>
        </li>
        
      </template>

      <li v-if="clientToInvoice && invoiceDate || invoiceNumber">
        <button @click="generateInvoice" :disabled="waitingForInvoiceLink">Generate Invoice</button>
      </li>

      <li v-if="downloadLink"><a :href="`https://starla.thebullittgroup.com${downloadLink}`">Click to download</a></li>

    </template>
    </ol>
  </div>
</template>

<script>
import moment from 'moment'
import hardCodedClients from '~/config/payroll/hardcoded-clients-york-2022-10-08'
export default {
  props: ['weekending','supplier'],
  data () {
    return {
      clientToInvoice: '',
      activeClients: false,
      waitingForClients: false,
      waitingForInvoiceLink: false,
      invoiceBy: false,
      invoiceDate: '',
      invoiceNumber: '',
      downloadLink: false
    }
  },
  mounted () {
    this.createSocket()
  },
  methods: {
    tryToReconnect () {
      this.reconnectInterval = setInterval(() => {
        try {
          this.createSocket()
          clearInterval(this.reconnectInterval)
        } catch (e) {
          console.log(e)
        }
      }, 1000)
    },
    createSocket () {
      this.socket = this.$nuxtSocket({
        name: 'payroll',
        transports: ['websocket'],
        path: '/ws/'
      })
      this.socket.on('update-clients', data => {
        this.waitingForClients = false
        this.activeClients = data.clients
      })
      this.socket.on('generate-invoice-link', data => {
        this.waitingForInvoiceLink = false
        this.downloadLink = data.link
      })
      this.socket.on('disconnect', reason => {
        this.$bus.log('Disconnected?', reason)

        this.tryToReconnect()
        
      })
    },
    async loadActiveClients () {

      /*
      await this.$axios.post(`/payroll/get-active-clients`, {weekending: this.weekending, supplier: this.supplier})
      .then(({data}) => {

        if (data == 'OK') this.waitingForClients = true
        //this.activeClients = data
      })
      */

      this.activeClients = hardCodedClients
      
    },
    async generateInvoice () {
      this.waitingForInvoiceLink = true

      let invoiceData = {
        supplier: this.supplier,
        invoiceBy: this.invoiceBy,
        invoiceNumber: this.invoiceNumber,
        invoiceDate: moment.utc(this.invoiceDate).format('YYYY-MM-DD'),
        clientToInvoice: this.clientToInvoice
      }

      await this.$axios.post('/payroll/invoice', invoiceData)
      .then(({data}) => console.log(data))
    }
  }
}
</script>
