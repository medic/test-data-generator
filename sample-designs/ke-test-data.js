import { faker } from '@faker-js/faker';

const YES_NO = [ 'yes', 'no' ];
const RELATIONSHIP = [ 'friend', 'sister', 'brother', 'mother', 'father' ];

/*
 *  PLACES
 */

const getPlace = (context, type, contactType, nameSuffix) => {
  return {
    type: type,
    contact_type: contactType,
    is_name_generated: 'true',
    name: `${faker.location.city()}'s ${nameSuffix}`,
    external_id: faker.string.alphanumeric(5),
    geolocation: '',
    meta: {
      created_by: context.username,
      created_by_person_uuid: '',
      created_by_place_uuid: ''
    },
    reported_date: faker.date
      .recent({ days: 20 })
      .getTime(),
  };
};

const getACounty = context => getPlace(context, 'contact', 'a_county', 'County');
const getSubCounty = context => getPlace(context, 'contact', 'b_sub_county', 'Sub County');
const getCHU = context => {
  return {
    ...getPlace(context, 'contact', 'c_community_health_unit', 'CHU'),
    code: faker.number.int({ min: 1, max: 100}),
  };
};
const getCHVArea = context => {
  return {
    ...getPlace(context, 'contact', 'd_community_health_volunteer_area', 'CHVArea'),
    link_facility_code: faker.string.alphanumeric(5),
    link_facility_name: `${faker.location.city()}'s facility`,
    chu_code: faker.string.alphanumeric(5),
    chu_name: `${faker.location.city()}'s unit`,
  };
};
const getHouseHold = context => {
  return {
    ...getPlace(context, 'contact', 'e_household', 'Household'),
    has_functional_latrine: faker.helpers.arrayElement(YES_NO),
    has_functional_handwashing_facility: faker.helpers.arrayElement(YES_NO),
    uses_treated_water: faker.helpers.arrayElement(YES_NO),
    has_functional_refuse_disposal_facility: faker.helpers.arrayElement(YES_NO),
    wash_status: 'Not good',
    has_insurance_cover: 'false',
    specific_insurance_cover: '',
    r_has_health_cover: faker.helpers.arrayElement(YES_NO),
    needs_registration_follow_up: faker.helpers.arrayElement(YES_NO),
  };
};

/*
 *  PEOPLE
 */

const getHouseholdClient = (context, { sex = faker.person.sex(), ageRange = { min: 20, max: 60 } } = {}) => {
  const dobRaw = faker.date.birthdate({ mode: 'age', ...ageRange});
  const dobFormatted = `${dobRaw.getFullYear()}-${dobRaw.getMonth()}-${dobRaw.getDay()}`;
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const middleName = faker.person.middleName();

  return {
    type: 'contact',
    contact_type: 'f_client',
    name: `${firstName} ${middleName} ${lastName}`,
    first_name: firstName,
    middle_name: middleName,
    last_name: lastName,
    sex: sex,
    date_of_birth: dobFormatted,
    phone: faker.helpers.fromRegExp(/[+]2547[0-9]{8}/),
    alternate_phone: faker.helpers.fromRegExp(/[+]2547[0-9]{8}/),
    dob_method: 'approx',
    dob_calendar: '',
    has_insurance: faker.helpers.arrayElement(YES_NO),
    insurance: '',
    identification_type: 'national_id',
    identification_number: faker.string.alphanumeric(5),
    age_in_years: faker.number.int({ min: 18, max: 80}),
    age_in_months: faker.number.int({ min: 216, max: 960}),
    next_of_kin: faker.person.fullName(),
    relationship_with_next_of_kin: faker.helpers.arrayElement(RELATIONSHIP),
    next_of_kin_residence: faker.location.streetAddress({ useFullAddress: true }),
    next_of_kin_phone: faker.helpers.fromRegExp(/[+]2547[0-9]{8}/),
    next_of_kin_alternate_phone: '',
    next_of_kin_email: faker.internet.email(),
    nationality: 'KE',
    country_of_birth: 'KE',
    county_of_birth: '36',
    county_of_residence: '36',
    subcounty: 'bomet-east',
    ward: 'kembu',
    village: 'Sisu',
    has_disability: faker.helpers.arrayElement(YES_NO),
    has_chronic_illness: faker.helpers.arrayElement(YES_NO),
    meta: {
      created_by: context.username,
      created_by_person_uuid: '',
      created_by_place_uuid: ''
    },
    reported_date: faker.date.recent({ days: 25 }).getTime(),
  };
};
const getPerson = (context, role, { sex = faker.person.sex(), ageRange = { min: 20, max: 60 } } = {}) => {
  const dobRaw = faker.date.birthdate({ mode: 'age', ...ageRange});
  const dobFormatted = `${dobRaw.getFullYear()}-${dobRaw.getMonth()}-${dobRaw.getDay()}`;
  return {
    type: 'person',
    name: faker.person.fullName(),
    short_name: faker.person.middleName(),
    date_of_birth: dobFormatted,
    date_of_birth_method: '',
    ephemeral_dob: {
      dob_calendar: dobFormatted,
      dob_method: '',
      dob_approx: dobRaw.toISOString(),
      dob_raw: dobFormatted,
      dob_iso: dobFormatted
    },
    sex,
    phone: faker.helpers.fromRegExp(/[+]2547[0-9]{8}/),
    phone_alternate: '',
    role: role,
    external_id:'',
    notes: '',
    meta: {
      created_by: context.username,
      created_by_person_uuid: '',
      created_by_place_uuid: ''
    },
    reported_date: faker.date.recent({ days: 25 }).getTime(),
  };
};

const getCHP = context => getPerson(context, 'chw');
const getCHPSupervisor = context => getPerson(context, 'chw_supervisor');
const getNurse = context => getPerson(context, 'nurse');
const getFacilityManager = context => getPerson(context, 'manager');

const addHierarchyAndCHPWithHouseholds = context => {
  return [
    {
      amount: 1,
      getDoc: () => getACounty(context),
      children: [
        {
          amount: 1,
          getDoc: () => getSubCounty(context),
          children: [
            {
              amount: 1,
              getDoc: () => getCHU(context),
              children: [
                {
                  amount: 1,
                  getDoc: () => getCHVArea(context),
                  children: [
                    {
                      amount: 1,
                      getDoc: () => getCHP(context)
                    },
                    {
                      amount: 1,
                      getDoc: () => getHouseHold(context),
                      children: [ { amount: 1, getDoc: () => getHouseholdClient(context) } ],
                    },
                    {
                      amount: 1,
                      getDoc: () => getHouseHold(context),
                      children: [ { amount: 1, getDoc: () => getHouseholdClient(context) } ],
                    },
                    {
                      amount: 1,
                      getDoc: () => getHouseHold(context),
                      children: [ { amount: 1, getDoc: () => getHouseholdClient(context) } ],
                    },
                    {
                      amount: 1,
                      getDoc: () => getHouseHold(context),
                      children: [ { amount: 1, getDoc: () => getHouseholdClient(context) } ],
                    },
                    {
                      amount: 1,
                      getDoc: () => getHouseHold(context),
                      children: [ { amount: 1, getDoc: () => getHouseholdClient(context) } ],
                    },
                    {
                      amount: 1,
                      getDoc: () => getHouseHold(context),
                      children: [ { amount: 1, getDoc: () => getHouseholdClient(context) } ],
                    },
                    {
                      amount: 1,
                      getDoc: () => getHouseHold(context),
                      children: [ { amount: 1, getDoc: () => getHouseholdClient(context) } ],
                    },
                  ]
                },
                {
                  amount: 1,
                  getDoc: () => getCHVArea(context),
                  children: [
                    {
                      amount: 1,
                      getDoc: () => getCHP(context)
                    },
                    {
                      amount: 1,
                      getDoc: () => getHouseHold(context),
                      children: [ { amount: 1, getDoc: () => getHouseholdClient(context) } ],
                    },
                    {
                      amount: 1,
                      getDoc: () => getHouseHold(context),
                      children: [ { amount: 1, getDoc: () => getHouseholdClient(context) } ],
                    },
                    {
                      amount: 1,
                      getDoc: () => getHouseHold(context),
                      children: [ { amount: 1, getDoc: () => getHouseholdClient(context) } ],
                    },
                    {
                      amount: 1,
                      getDoc: () => getHouseHold(context),
                      children: [ { amount: 1, getDoc: () => getHouseholdClient(context) } ],
                    },
                    {
                      amount: 1,
                      getDoc: () => getHouseHold(context),
                      children: [ { amount: 1, getDoc: () => getHouseholdClient(context) } ],
                    },
                    {
                      amount: 1,
                      getDoc: () => getHouseHold(context),
                      children: [ { amount: 1, getDoc: () => getHouseholdClient(context) } ],
                    },
                    {
                      amount: 1,
                      getDoc: () => getHouseHold(context),
                      children: [ { amount: 1, getDoc: () => getHouseholdClient(context) } ],
                    },
                  ]
                },
                {
                  amount: 1,
                  getDoc: () => getCHVArea(context),
                  children: [
                    {
                      amount: 1,
                      getDoc: () => getCHP(context)
                    },
                    {
                      amount: 1,
                      getDoc: () => getHouseHold(context),
                      children: [ { amount: 1, getDoc: () => getHouseholdClient(context) } ],
                    },
                    {
                      amount: 1,
                      getDoc: () => getHouseHold(context),
                      children: [ { amount: 1, getDoc: () => getHouseholdClient(context) } ],
                    },
                    {
                      amount: 1,
                      getDoc: () => getHouseHold(context),
                      children: [ { amount: 1, getDoc: () => getHouseholdClient(context) } ],
                    },
                    {
                      amount: 1,
                      getDoc: () => getHouseHold(context),
                      children: [ { amount: 1, getDoc: () => getHouseholdClient(context) } ],
                    },
                    {
                      amount: 1,
                      getDoc: () => getHouseHold(context),
                      children: [ { amount: 1, getDoc: () => getHouseholdClient(context) } ],
                    },
                    {
                      amount: 1,
                      getDoc: () => getHouseHold(context),
                      children: [ { amount: 1, getDoc: () => getHouseholdClient(context) } ],
                    },
                    {
                      amount: 1,
                      getDoc: () => getHouseHold(context),
                      children: [ { amount: 1, getDoc: () => getHouseholdClient(context) } ],
                    },
                    {
                      amount: 1,
                      getDoc: () => getHouseHold(context),
                      children: [ { amount: 1, getDoc: () => getHouseholdClient(context) } ],
                    },
                    {
                      amount: 1,
                      getDoc: () => getHouseHold(context),
                      children: [ { amount: 1, getDoc: () => getHouseholdClient(context) } ],
                    },
                    {
                      amount: 1,
                      getDoc: () => getHouseHold(context),
                      children: [ { amount: 1, getDoc: () => getHouseholdClient(context) } ],
                    },
                  ]
                },
                {
                  amount: 1,
                  getDoc: () => getCHVArea(context),
                  children: [
                    {
                      amount: 1,
                      getDoc: () => getCHP(context)
                    },
                    {
                      amount: 1,
                      getDoc: () => getHouseHold(context),
                      children: [ { amount: 1, getDoc: () => getHouseholdClient(context) } ],
                    },
                    {
                      amount: 1,
                      getDoc: () => getHouseHold(context),
                      children: [ { amount: 1, getDoc: () => getHouseholdClient(context) } ],
                    },
                    {
                      amount: 1,
                      getDoc: () => getHouseHold(context),
                      children: [ { amount: 1, getDoc: () => getHouseholdClient(context) } ],
                    },
                    {
                      amount: 1,
                      getDoc: () => getHouseHold(context),
                      children: [ { amount: 1, getDoc: () => getHouseholdClient(context) } ],
                    },
                    {
                      amount: 1,
                      getDoc: () => getHouseHold(context),
                      children: [ { amount: 1, getDoc: () => getHouseholdClient(context) } ],
                    },
                  ]
                },
              ]
            },
          ]
        },
      ]
    },
  ];
};

const addFamilyToHouseholds = (context, householdParent, amountFamilyMembers, householdIds) => {
  return householdIds.map(householdId => {
    return {
      amount: amountFamilyMembers,
      getDoc: () => {
        return {
          ...getHouseholdClient(context),
          parent: householdParent,
        };
      }
    };
  });
};

/*
 *  REPORTS
 */

const getSexualGenderViolenceReport = (context, patient, reportedDaysAgo=9) => {
  //console.log('sgbv - patient:', patient);
  return {
    form: 'sgbv',
    type: 'data_record',
    content_type: 'xml',
    reported_date: faker.date.recent({ days: reportedDaysAgo }).getTime(),
    // contact: { _id: chw._id },
    from: faker.helpers.fromRegExp(/[+]2547[0-9]{8}/),
    fields: {
      patient_uuid: patient._id,
      patient_id: patient._id,
      patient_name: patient.name,
      sgbv: {
        sgbv_observe_note: faker.lorem.words(),
        has_observed_sgbv_signs: faker.helpers.arrayElement(YES_NO),
        sgbv_signs_observed: faker.lorem.words(),
        is_referred_to_cha: 'yes'
      },
    },
  };
};

const getCHVSignalReporting = (context, household, reportedDaysAgo=9) => {
  return {
    form: 'chv_signal_reporting',
    type: 'data_record',
    content_type: 'xml',
    reported_date: faker.date.recent({ days: reportedDaysAgo }).getTime(),
    from: faker.helpers.fromRegExp(/[+]2547[0-9]{8}/),
    fields: {
      place_uuid: household._id,
      chw_area_id: household._id,
      signal_code: '3',
      signal_type_label:
        '3. Any child less than 15 years with a sudden onset of weakness of the legs and arms not due to injury',
      chv_signal: {
        signal_type: 'child_weak_legs_arms',
        signal_description: faker.lorem.lines(1),
      },
    },
    case_id: faker.string.alphanumeric(5),
  };
};

const getOverFiveAssessment = (context, patient, reportedDaysAgo=9) => {
  return {
    form: 'over_five_assessment',
    type: 'data_record',
    content_type: 'xml',
    reported_date: faker.date.recent({ days: reportedDaysAgo }).getTime(),
    from: faker.helpers.fromRegExp(/[+]2547[0-9]{8}/),
    fields: {
      place_uuid: patient.parent._id,
      chw_area_id: patient.parent._id,
      patient_uuid: patient._id,
      patient_id: patient._id,
      patient_name: patient.parent.name,
      is_malaria_endemic: true,
      is_pregnant: false,
      is_in_pnc: false,
      needs_follow_up: 'yes',
      has_been_referred: 'yes',
      has_malaria: false,
      needs_general_danger_signs_referral: false,
      needs_general_signs_symptoms_referral: false,
      needs_fever_referral: false,
      needs_malaria_referral: false,
      needs_tb_referral: false,
      needs_diarrhoea_referral: false,
      needs_diabetes_referral: true,
      needs_hypertension_referral: true,
      needs_mental_health_referral: true,
      needs_sgbv_referral: false,
      diabetes_referral_follow_up_date: '2024-02-12',
      hypertension_referral_follow_up_date: '2024-02-12',
      mental_health_referral_follow_up_date: '2024-02-12',
      is_hypertensive_display: 'No',
      is_diabetic_display: 'No',
      visited_contact_uuid: patient._id,
      is_curr_diabetic: true,
      is_curr_hypertensive: true,
      referred_to_facility_code: 'X facility code',
      referred_to_facility_name: 'X facility',
      assessment: {
        is_sick: 'no'
      },
      group_hiv: {
        knows_hiv_status: 'no',
      },
      group_diabetes: {
        is_diabetic: 'no',
        diabetes_symptoms: 'thirst_or_hunger',
      },
      group_hypertension: {
        is_hypertensive: 'no',
        hypertension_symptoms: 'severe_headache',
        bp_label: 'INDETERMINATE',
        bp_label_color: 'orange',
        bp_values_valid: false,
      },
      group_cancer: {
        is_screened_cancer: 'no',
      },
      group_mental_health: {
        mental_signs: 'tearfulness',
        observed_mental_signs: 'irritability_agitated',
      },
      group_sexual_gender_based_violence: {
        has_observed_signs_of_violence: 'no'
      },
      insurance: {
        upto_date_insurance: 'no',
      },
      group_summary: {
        header_label: 'RESULTS',
      },
      additional_doc: {
        place_id: patient.parent._id,
        chv_area_id: patient.parent._id,
        type: 'data_record',
        content_type: 'xml',
        form: 'chv_consumption_log',
        fields: {
          rdts_quantity_issued: 0,
          act_6_quantity_issued: 0,
          act_12_quantity_issued: 0,
          act_18_quantity_issued: 0,
          act_24_quantity_issued: 0,
          dt_250_quantity_issued: 0,
          ors_zinc_quantity_issued: 0,
          ors_sachets_quantity_issued: 0,
          zinc_sulphate_quantity_issued: 0,
          albendazole_quantity_issued: 0,
          tetra_eye_quantity_issued: 0,
          paracetamol_120_quantity_issued: 0,
          mebendazole_quantity_issued: 0,
          coc_quantity_issued: 0,
          prog_quantity_issued: 0,
          depo_im_quantity_issued: 0,
          depo_sc_quantity_issued: 0,
          preg_strip_quantity_issued: 0,
          chlorine_quantity_issued: 0,
          gluc_strips_quantity_issued: 0,
          paracetamol_500_quantity_issued: 0,
          bandages_quantity_issued: 0,
          povi_quantity_issued: 0,
          strap_quantity_issued: 0,
          gloves_quantity_issued: 0,
          envelopes_quantity_issued: 0
        },
      },
      data: {
        _upi: '',
        _patient_name: patient.name,
        _referred_to_facility_code: 'X facility code',
        _referred_to_facility_name: 'X facility',
        _follow_up_date: '2024-02-12',
        _screening: {
          _diabetes_symptoms: 'thirst_or_hunger',
          _hypertension_symptoms: 'severe_headache',
          _mental_signs: 'tearfulness',
          _observed_mental_signs: 'irritability_agitated'
        },
        _supporting_info: {
          _knows_hiv_status: 'no',
          _is_screened_cancer: 'no',
          _has_observed_signs_of_violence: 'no'
        },
      },
    },
  };
};

const addReportsToHouseholds = (context, householdIds) => {
  return householdIds.map(householdId => {
    return {
      amount: 10,
      getDoc: () => {
        return {
          contact: { _id: householdId }
        };
      },
    };
  });
};

const addReportsToPatient = (context, patients, reportedDaysAgo) => {
  return patients.map(patientID => {
    return {
      amount: 5,
      getDoc: () => getSexualGenderViolenceReport(context, patientID, reportedDaysAgo),
    };
  });
};

export default (context) => {
  return [
    {
      designId: 'a_county',
      amount: 1,
      getDoc: () => getACounty(context),
      children: [
        {
          designId: 'b_sub_county',
          amount: 1,
          getDoc: ({ parent }) => {
            console.log('b_sub_county - parent: ', parent._id, parent);
            return getSubCounty(context);
          },
          children: [
            {
              designId: 'c_community_health_unit',
              amount: 1,
              getDoc: () => getCHU(context),
              children: [
                {
                  designId: 'd_community_health_volunteer_area',
                  amount: 3,
                  getDoc: () => getCHVArea(context),
                  children: [
                    {
                      designId: 'chw',
                      amount: 1,
                      getDoc: () => getCHP(context),
                    },
                    {
                      designId: 'e_household',
                      amount: 110,
                      getDoc: () => getHouseHold(context),
                      children: [
                        {
                          designId: 'CHVSignalReporting',
                          amount: 1,
                          getDoc: ({ parent }) => getCHVSignalReporting(context, parent),
                        },
                        {
                          designId: 'f_client',
                          amount: 8,
                          getDoc: () => getHouseholdClient(context),
                          children: [
                            {
                              designId: 'sgbv',
                              amount: 1,
                              getDoc: ({ parent }) => getSexualGenderViolenceReport(context, parent),
                            },
                            {
                              designId: 'over-five-assessment',
                              amount: 1,
                              getDoc: ({ parent }) => getOverFiveAssessment(context, parent),
                            }
                          ],
                        }
                      ],
                    }
                  ],
                }
              ],
            }
          ],
        }
      ],
    }
  ];
};
