<template>
<nav>
  <ul>
    <!--n-link custom to="/tracker" v-slot="{navigate}">
      <li @click="navigate">Tracker</li>
    </n-link-->
    <li>
      <n-link custom to="/" v-slot="{navigate, href}">
        <a :href="href" @click="navigate">Home</a>
      </n-link>
    </li>
    
    <li v-if="hasPermissions('Tracker')">
      <n-link custom to="/tracker" v-slot="{navigate, href}">
        <a :href="href" @click="navigate">Tracker</a>
      </n-link>
    </li>
    
    <li v-if="hasPermissions('Payroll - Import') || hasPermissions('Payroll - Timecards')">
      <span>Payroll</span>
      <ul>
        <li v-if="hasPermissions('Payroll - Timecards')">
          <n-link custom to="/payroll/timecards" v-slot="{navigate, href}">
            <a :href="href" @click="navigate">Timecard Entry</a>
          </n-link>
        </li>
        <li v-if="hasPermissions('Payroll - Import')">
          <n-link custom to="/payroll/import" v-slot="{navigate, href}">
            <a :href="href" @click="navigate">Newbie Import</a>
          </n-link>
        </li>
        
      </ul>
    </li>
    
  </ul>
</nav>
</template>

<script>
  import {mapGetters} from 'vuex'
export default {
  computed: {
    ...mapGetters(['hasPermissions'])
  }
}
</script>

<style lang="scss" scoped>

nav {
  
  background: #eee;
  width: 100%;
  padding: 0 20px;
  font-size: .9rem;
  position: relative;
  > ul {
    display: block;
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: 0;
    
    left: 0;
    top: 0;
    z-index: 2;
    > li{
      display: inline-block;
      height: 100%;
      font-size: .9rem;
      > a,
      > span {
        display: inline-block;
        padding: 8px 20px;
        text-decoration: none;
        color: #333;
        background: rgba(#900000, 0);
        transition: .2s;
        
      }

      &:hover {
        > a,
        > span {
          background: #990000;
          color: white;
          cursor: pointer;
        }
      }
    }
  }
}
nav {
  > ul {

    z-index: 1;

    > li {

      position: relative;

      &:hover {
        > ul{
          display: block;
          transform: translateX(0);
          opacity: 1;
          pointer-events: all;
          
        }
      }

       > ul {
        display: block;
        top: 100%;
        bottom: auto;
        transform: translateX(-20px);
        opacity: 0;
        height: auto;
        position: absolute;
        left: 0;
        bottom: 0;
        width: auto;
        padding: 0;
        list-style: none;
        pointer-events: none;
        z-index: 1;
        transition: .2s;

        > li {
          display: block;
          white-space: nowrap;
          background: #990000;
          color: white;
          width: 100%;
          height: auto;
          
          

          &:hover{
            background: #700202;
            cursor: pointer;
          }
          
          a {
            color: white;
            text-decoration: none;
            display: flex;
            height: 40px;
            width: 100%;
            padding: 0 20px;
            align-items: center;
          }
        }
      }
    }

  }
}
</style>