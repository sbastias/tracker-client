<template>
  <div id="timecard-filters-container">
    <div class="filters" style="padding-top: 10px;">

      <ul v-for="_type in types" :key="`filters-${_type}`" :id="`${ _type }-filters`">
        <li v-for="(filter, idx) in filters[_type]" :key="`${_type}-filter-${idx}`">
          <label :class="{active: filter.active}">
            <input type="checkbox" v-model="filter.active" readonly />
            {{filter.label || 'Undefined'}}
          </label>
        </li>
      </ul>
      
    </div>
  </div>
</template>

<script>

export default {
  props: ['filters'],
  data () {
    return {
      types: ['payType','shift','client']
    }
  }
}
</script>

<style lang="scss">

#timecard-filters-container{

  background-color: #eee;

.filters {
  text-transform: uppercase;
  display: flex;
  margin-top: 10px;
  

  ul {
    display: inline-block;
    list-style: none;
    margin: 0;
    padding: 0;
    
    margin-right: 50px;
    width: max-content;
    padding-right: 30px;
    

    &:before {
      display: inline-block;
      content: '';
      font-size: .7rem;
      font-weight: bold;
      width: 100%;
      padding-bottom: 5px;
      border-bottom: 1px dotted #ccc;
      margin-bottom: 5px;
    }

    &#payType-filters:before {content: 'Pay Types'}
    &#client-filters:before {content: 'Clients'}
    &#shift-filters:before {content: 'Shift'}

    li {      
      display: block;
      
      label {
        input {
          height: 9px;
        }
        cursor: pointer;
        font-size: 9px;
        color: #aaa;
        word-spacing: 0;
        line-height: 15px;
        &:hover {
          opacity: .6;
        }
        &.active {
          color: black
        }
      }
    }
  }

}
}
</style>