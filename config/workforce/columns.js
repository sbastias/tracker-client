export default {
  common: [
    {
      label: '',
      width: 25,
      orderIdx: 10
    },
    {
      label: 'Candidate Name',
      width: 200,
      orderIdx: 20
    },
    {
      label: 'Email',
      field: 'Email',
      toggle: true,
      width: 200,
      orderIdx: 30
    },
    {
      label: 'Last Activity',
      field: 'LastModifiedDate',
      toggle: true,
      width: 100,
      orderIdx: 40
    },
    {
      label: 'Primary Occupation',
      field: 'Primary_Occupation__c',
      toggle: true,
      width: 250,
      orderIdx: 50
    },
    {
      label: 'Inbound',
      field: 'Start_Date',
      sortable: true,
      toggle: true,
      width: 90,
      orderIdx: 60
    },
    {
      label: 'Outbound',
      field: 'End_Date',
      sortable: true,
      toggle: true,
      width: 90,
      orderIdx: 70
    },
    
    {
      label: 'Department',
      field: 'Department__c',
      toggle: true,
      width: 300,
      orderIdx: 90
    },
    {
      label: 'Province',
      field: 'MailingState',
      toggle: true,
      width: 150,
      orderIdx: 110
    },
    {
      label: 'Notes & Comments',
      field: 'AVTRRT__Notes_and_Comments__c',
      toggle: true,
      width: 300,
      orderIdx: 120,
      internalOnly: true
    },
    {
      label: 'Job Title',
      field: 'AVTRRT__Job_Title__c',
      toggle: true,
      width: 350,
      orderIdx: 130
    },
    
    {
      label: 'Status',
      field: 'AVTRRT__Candidate_Status__c',
      sortable: true,
      toggle: true,
      width: 160,
      editable: true,
      orderIdx: 140
    },

    {
      label: 'Last Update',
      field: 'Last_Update_Date__c',
      sortable: true,
      toggle: true,
      width: 105,
      editable: true,
      orderIdx: 150
    },

    {
      label: 'Last Status',
      field: 'Last_Update_Status__c',
      sortable: true,
      toggle: true,
      width: 200,
      editable: true,
      orderIdx: 160
    },

    {
      label: 'Recruiter',
      field: 'Recruiter',
      sortable: true,
      toggle: true,
      width: 160,
      orderIdx: 170,
      internalOnly: true
    },

    {
      label: 'Handler',
      field: 'Handler',
      sortable: true,
      toggle: true,
      width: 160,
      editable: true,
      orderIdx: 180,
      internalOnly: true
    },
    
    {
      label: 'Job Stage',
      field: 'AVTRRT__Stage__c',
      sortable: true,
      toggle: true,
      width: 250,
      editable: true,
      orderIdx: 190,
      internalOnly: true
    },

    

    {
      label: 'Cognibox',
      field: 'Cognibox_Training__c',
      toggle: true,
      width: 300,
      orderIdx: 200,
      exclude: ['VG','ACDC']
    },
    
   
    {
      label: 'Criminal Check',
      field: 'Criminal_Check__c',
      sortable: true,
      toggle: true,
      width: 300,
      orderIdx: 210
    },
    {
      label: 'CC Result',
      field: 'Criminal_Check_Result__c',
      toggle: true,
      width: 200,
      orderIdx: 220
    },
    {
      label: 'Drug/Alcohol Test',
      field: 'Drug_and_Alcohol_Test_Date__c',
      sortable: true,
      toggle: true,
      width: 120,
      orderIdx: 230,
      exclude: ['BIM']
    },
    {
      label: 'Drug/Alcohol Result',
      field: 'Drug_and_Alcohol_Result__c',
      toggle: true,
      width: 200,
      orderIdx: 240,
      exclude: ['BIM']
    },
    {
      label: 'Med. Testing',
      field: 'Medical_Testing_Date__c',
      sortable: true,
      toggle: true,
      width: 90,
      orderIdx: 250,
      exclude: ['VG']
    },
    {
      label: 'Med. Follow Up',
      field: 'Medical_Follow_Up_Date__c',
      sortable: true,
      toggle: true,
      width: 120,
      orderIdx: 260,
      exclude: ['VG']
    },
  ],
  BIM: [
    
    {
      label: 'Med. Clearance',
      field: 'Medical_Clearance__c',
      sortable: true,
      toggle: true,
      width: 120,
      orderIdx: 270
    },
    {
      label: 'Fit for Site',
      field: 'Fit_for_Site_Date__c',
      sortable: true,
      toggle: true,
      width: 90,
      orderIdx: 280
    },
    {
      label: 'Med. Expiry',
      field: 'Medical_Expiry_Date__c',
      sortable: true,
      toggle: true,
      width: 90,
      orderIdx: 290
    },
  ],
  ACDC: [
    {
      label: 'Med. Clearance',
      field: 'Ekati_Medical_Clearance__c',
      sortable: true,
      toggle: true,
      width: 120,
      orderIdx: 300
    },
    {
      label: 'Med. Expiry',
      field: 'Ekati_Medical_Clearance_Result__c',
      toggle: true,
      width: 90,
      orderIdx: 310
    },
    {
      label: 'Security Clearance',
      field: 'Ekati_Security_Clearance__c',
      sortable: true,
      toggle: true,
      width: 120,
      orderIdx: 320
    },
    {
      label: 'Security Clearance Result',
      field: 'Ekati_Security_Clearance_Result__c',
      toggle: true,
      width: 200,
      orderIdx: 330
    },
  ],
  VG: [
    {
      label: 'VG Drug/Alcohol Clearance',
      field: 'VG_D_A_Clearance_Date__c',
      sortable: true,
      toggle: true,
      width: 200,
      orderIdx: 340
    },
  ]
}