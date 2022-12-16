<template>
<div>
 <svg
    v-if="name == 'email'"
    id="email-icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 318.38 186.03"
  >
    <path
      class="cls-1"
      d="M159.19,101.63L314.77,5.48c-2.82-3.35-7.04-5.48-11.76-5.48H15.37C10.65,0,6.43,2.13,3.61,5.48L159.19,101.63Z"
    />
    <path
      class="cls-1"
      d="M159.29,132.69l-.1-.16-.1,.16L0,34.36V170.66c0,8.49,6.88,15.37,15.37,15.37H303.01c8.49,0,15.37-6.88,15.37-15.37V34.36l-159.09,98.33Z"
    />
  </svg>

  <svg v-if="name == 'salesforce'" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" id="salesforce-icon"
	 viewBox="0 0 52 52" enable-background="new 0 0 52 52" xml:space="preserve">
  <path class="cls-1" d="M21.7,11.9c1.7-1.7,4-2.8,6.6-2.8c3.4,0,6.4,1.9,8,4.7c1.4-0.6,2.9-1,4.5-1C47,12.8,52,17.8,52,24
    s-5,11.2-11.2,11.2c-0.8,0-1.5-0.1-2.2-0.2c-1.4,2.5-4.1,4.2-7.2,4.2c-1.3,0-2.5-0.3-3.6-0.8c-1.4,3.3-4.7,5.6-8.6,5.6
    c-4,0-7.5-2.5-8.8-6.1c-0.6,0.1-1.2,0.2-1.8,0.2c-4.8,0-8.7-3.9-8.7-8.7c0-3.2,1.7-6,4.3-7.5c-0.5-1.2-0.8-2.6-0.8-4
    c0-5.5,4.5-10,10.1-10C17,8,19.9,9.5,21.7,11.9"/>
  </svg>

  <svg v-if="name == 'documents'" id="Layer_2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.79 25.06">
    <rect x="9.34" y="11.57" width="7.46" height="1.28" />
    <rect x="9.34" y="14.57" width="7.46" height="1.28" />
    <rect x="9.34" y="17.57" width="7.46" height="1.28" />
    <path d="M16.66,5.84V2.92h-3.13V0H0V19.23H3.13v2.92h3.13v2.92h13.53V5.84h-3.13ZM3.13,18.23H1V1H12.53v1.92H3.13v15.31Zm3.13,0v2.92h-2.13V3.92H15.66v1.92H6.27v12.39Zm12.53,5.84H7.27V6.84h11.53V24.06Z" />
  </svg>


</div>
</template>

<script>
export default {
  props: ['name']
}
</script>

<style lang="scss">
#email-icon {
  
  width: 100%;

  .cls-1 {
    fill: #c8c8c8;
    transition: .2s;
  }
  
  &:hover{
    .cls-1 {
      fill: #990000;
    }
  }
}
#salesforce-icon {
  
  width: 100%;

  .cls-1 {
    fill: #c8c8c8;
    transition: .2s;
  }
  
  &:hover{
    .cls-1 {
      fill: #990000;
    }
  }
}
</style>
