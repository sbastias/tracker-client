export default {
  common: [
    {
      label: 'Candidate Name',
      width: 160
    },
    {
      label: 'Email',
      field: 'Email',
      toggle: true,
      width: 200
    },
    {
      label: 'Job Title',
      field: 'AVTRRT__Job_Title__c',
      toggle: true,
      width: 350
    },
    
    {
      label: 'Department (Job)',
      field: 'Department_from_Job',
      sortable: true,
      toggle: true,
      width: 160
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
      field: 'Expected_End_Date__c',
      sortable: true,
      toggle: true,
      width: 90
    },
    {
      label: 'Location',
      field: 'Starting_Work_Location__c',
      sortable: true,
      toggle: true,
      width: 110
    },
    
    {
      label: 'Job Stage',
      field: 'AVTRRT__Stage__c',
      sortable: true,
      toggle: true,
      width: 250
    },
    
    {
      label: 'Primary Occupation',
      field: 'Primary_Occupation__c',
      toggle: true,
      width: 250
    },
    {
      label: 'Department*',
      field: 'Department__c',
      toggle: true,
      width: 300
    },
    {
      label: 'Criminal Check',
      field: 'Criminal_Check__c',
      sortable: true,
      toggle: true,
      width: 300
    },
    {
      label: 'CC Result',
      field: 'Criminal_Check_Result__c',
      toggle: true,
      width: 200
    },
    {
      label: 'Drug/Alcohol Test',
      field: 'Drug_and_Alcohol_Test_Date__c',
      sortable: true,
      toggle: true,
      width: 120
    },
    {
      label: 'Drug/Alcohol Result',
      field: 'Drug_and_Alcohol_Result__c',
      toggle: true,
      width: 200
    },
    {
      label: 'Med. Testing',
      field: 'Medical_Testing_Date__c',
      sortable: true,
      toggle: true,
      width: 90
    },
    {
      label: 'Med. Follow Up',
      field: 'Medical_Follow_Up_Date__c',
      sortable: true,
      toggle: true,
      width: 120
    },
  ],
  BIM: [
    {
      label: 'Med. Clearance',
      field: 'Medical_Clearance__c',
      sortable: true,
      toggle: true,
      width: 120
    },
    {
      label: 'Fit for Site',
      field: 'Fit_for_Site_Date__c',
      sortable: true,
      toggle: true,
      width: 90
    },
    {
      label: 'Med. Expiry',
      field: 'Medical_Expiry_Date__c',
      sortable: true,
      toggle: true,
      width: 90
    },
  ],
  ACDC: [
    {
      label: 'Med. Clearance',
      field: 'Ekati_Medical_Clearance__c',
      sortable: true,
      toggle: true,
      width: 120
    },
    {
      label: 'Med. Expiry',
      field: 'Ekati_Medical_Clearance_Result__c',
      toggle: true,
      width: 90
    },
    {
      label: 'Security Clearance',
      field: 'Ekati_Security_Clearance__c',
      sortable: true,
      toggle: true,
      width: 120
    },
    {
      label: 'Security Clearance Result',
      field: 'Ekati_Security_Clearance_Result__c',
      toggle: true,
      width: 200
    },
  ],
  VG: [
    {
      label: 'VG Drug/Alcohol Clearance',
      field: 'VG_D_A_Clearance_Date__c',
      sortable: true,
      toggle: true,
      width: 140
    },
  ]
}