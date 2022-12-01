<template>
  <div>

    <div class="overlay-heading">
      <h3>Documents</h3>
    </div>

    <div v-show="loadingDocuments">
      <Loader message="Loading Documents..." />
    </div>

    <div v-show="!!documents">
      <ul v-if="documents.length > 0">
        <li v-for="(doc, idx) in documents" :key="`doc-${idx}`">
          <a @click="downloadFile" :data-id="doc.file.ContentDocumentId" :data-filename="doc.Name">{{doc.Name}}</a>
        </li>
      </ul>
      <span v-else>Sorry, we don't have documents for {{FirstName}}. Please contact our office if you require more information.</span>
    </div>

  </div>
</template>

<script>
import Loader from '~/components/ui/Loader'
import { mapGetters } from 'vuex'
export default {
  props: ['original-placement','prospect'],
  components: {
    Loader
  },
  data () {
    return {
      documents: false,
      loadingDocuments: false
    }
  },
  computed: {
    ...mapGetters(['accessToken']),
    FirstName () {
      return this.originalPlacement && this.originalPlacement.AVTRRT__Contact_Candidate__r.FirstName || this.prospect.Candidate__r.FirstName
    }
  },
  mounted () {
    this.loadDocuments()
  },
  methods: {
    async loadDocuments () {
      console.log('Loading Documents...')
      this.loadingDocuments = true

      let documentFolderId = this.originalPlacement && this.originalPlacement.AVTRRT__Contact_Candidate__r.Document_Folder__c || this.prospect.Candidate__r.Document_Folder__c

      await this.$axios.get(`/tracker/documents/load/${ documentFolderId }`)
      .then(({data}) => {
        return this.documents = data
      })
      .catch(e => {
        let {message, stack} = e.response.data
        this.$bus.$emit('toaster',{status: 'error', message})
        console.log(stack)
      })
      .finally(() => {
        this.loadingDocuments = false
      })
    },
    async downloadFile ($ev) {

      $ev.preventDefault()
      
      let contentDocumentId = $ev.target.dataset.id
      await this.$axios.get(`https://na77.salesforce.com/services/data/v50.0/sobjects/ContentDocument/${contentDocumentId}`,{headers: {Authorization: `Bearer ${this.accessToken}`}}).then(({data}) => data)
      .then(contentDocument => {


        console.log('contentDocument:', contentDocument)

        let downloadFilename =  [$ev.target.dataset.filename, contentDocument.FileExtension].join('.')

        return this.$axios({
          url: `https://na77.salesforce.com/services/data/v42.0/sobjects/ContentVersion/${contentDocument.LatestPublishedVersionId}/VersionData`,
          method: 'GET',
          responseType: 'blob', // important
          headers: {Authorization: `Bearer ${this.accessToken}`}
        }).then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', downloadFilename); //or any other extension
          //link.target = "_blank"
          document.body.appendChild(link);
          link.click();
        }).catch(e => {
          throw e
        })

      })
      .catch(e => {
        let {message, stack} = e.response.data
        this.$bus.$emit('toaster',{status: 'error', message})
        console.log(stack)
      })

    },
  },
  watch: {
    
  }
}
</script>

<style lang="scss" scoped>

ul {
  list-style: none;
  margin: 0;
  margin-top: -15px;
  padding: 0;
  > li {
    padding: 15px;
    &:not(:last-child) {
      border-bottom: 1px solid #ddd;
    }
  }
}
</style>

