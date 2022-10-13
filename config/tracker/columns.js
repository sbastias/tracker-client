export default [
  {
    label: '',//placement link
    width: 45
  },
  {
    label: '',//email
    width: 45
  },
  {
    label: 'Candidate Name',
    width: 160
  },
  {
    label: 'Placement #',
    field: 'Name',
    width: 100,
    toggle: false
  },
  {
    label: 'Job Title',
    field: 'AVTRRT__Job_Title__c',
    toggle: true,
    width: 160
  },
  {
    label: 'Department',
    field: 'Department__c',
    sortable: true,
    toggle: true,
    width: 160
  },
  {
    label: 'Pay Rate',
    field: 'candidateCompensation',
    toggle: false,
    width: 80
  },
  {
    label: 'Crew',
    field: 'Crew__c',
    sortable: true,
    toggle: true,
    width: 50
  },
  {
    label: 'Shift',
    field: 'Shift__c',
    sortable: true,
    toggle: true,
    width: 50
  },
  {
    label: 'Inbound',
    field: 'AVTRRT__Start_Date__c',
    sortable: true,
    toggle: true,
    width: 90
  },
  {
    label: 'Outbound',
    field: 'AVTRRT__End_Date__c',
    sortable: true,
    toggle: true,
    width: 90
  },
  {
    label: 'Location',
    field: 'Client_Location__c',
    sortable: true,
    toggle: true,
    width: 110
  },
  {
    label: 'Flight',
    field: 'Flight__c',
    toggle: true,
    width: 150
  },
  {
    label: 'Rotation Communication',
    field: 'Rotation_Communication__c',
    sortable: true,
    toggle: true,
    width: 160
  },
  {
    label: 'Notes',
    field: 'Additional_Notes__c',
    toggle: true,
    width: 150
  },
  {
    label: 'Coverage',
    field: 'Coverage__c',
    toggle: true,
    width: 150
  },
  {
    label: 'Airport',
    field: 'Client_Airport__c',
    toggle: true,
    width: 90
  },
  {
    label: 'PO #',
    field: 'PO__c',
    sortable: true,
    toggle: true,
    width: 100
  },
  {
    label: 'Supplier',
    field: 'Supplier__c',
    sortable: true,
    toggle: true,
    width: 70
  },
  {
    label: 'Deployment',
    field: 'Deployment_Forms__c',
    sortable: true,
    toggle: true,
    width: 180
  },
  {
    label: 'Internal Status',
    field: 'Internal_Status__c',
    sortable: true,
    toggle: true,
    width: 150
  },
  
]