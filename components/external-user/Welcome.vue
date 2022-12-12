<template>
  <div class="content-container">

    <h1>Welcome to Starla, {{user.FirstName}}!</h1>

    <div class="bordered">
      <p>Starla is our custom-built software that lets you connect with our database so you can see who we've scheduled for you and your team, their timecards, your POs, PO values, and hours/values which have been billed against those POs.  We are still in early days of development and we welcome your feedback.</p>
      
      <div id="some-notes">
        Some notes:
        <ol>
          <li>You'll soon see some helpful tool-tips to help you navigate Starla</li>
          <li>You'll soon be able to approve time cards for Contractors</li>
          <li>You'll soon be able to know what invoices have been used for which contractor and what is paid/not-paid</li>
          <li>You can view Contractor hire documents by clicking on the Contractor Name in the <n-link to="/tracker">Tracker</n-link></li>
        </ol>
      </div>

      <p>Thanks for your patience as we build Starla further to help you know what's happening on our side as we work to support your operations.</p>

      <div id="contacts">
        <div>
          <div><b>Dave Kennedy</b> - Director</div>
          <div><a href="mailto:david@thebullittgroup.com">david@thebullittgroup.com</a></div>
        </div>
        <div>
          <div><b>Jenna Mitchell</b> - Coordinator</div>
          <div><a href="mailto:jenna@thebullittgroup.com">jenna@thebullittgroup.com</a></div>
        </div>
      </div>

    </div>

  </div>
</template>

<script>
export default {
  props: ['user']
}
</script>

<style lang="scss">
.content-container {
  width: 95%;
  max-width: 1200px;
  margin: 50px auto;
  line-height: 1.8;

  .bordered {
    width: 100%;
    padding: 20px 40px;
    background: rgb(255, 249, 205);
    border: 1px solid rgb(232, 201, 2);
    p{
      margin: 20px 0;
    }

    #some-notes {
      padding: 20px;
      background: rgba(255,255,255,0.5);
    }
    #contacts{
      display: grid;
      grid-gap: 40px;
      grid-template-columns: repeat(2, max-content);
      margin: 20px 0;
    }
  }
}
</style>