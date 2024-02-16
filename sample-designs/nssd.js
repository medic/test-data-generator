import { faker } from '@faker-js/faker';

const YES_NO = [ 'yes', 'no' ];

const getPlace = (context, contactType, nameSuffix) => {
  return {
    type: 'contact',
    contact_type: contactType,
    name: `${faker.location.city()}'s ${nameSuffix}`,
    external_id: faker.string.alphanumeric(5),
    notes: faker.lorem.lines(2),
    place_id: faker.string.numeric({ length: 5 }),
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

const getCenter = context => getPlace(context, 'c10_center', 'Center');

const getProvince = context => getPlace(context, 'c20_province', 'Province');

const getDistrict = context => getPlace(context, 'c30_district', 'District');

const getMunicipality = context => getPlace(context, 'c40_municipality', 'Municipality');

const getWard = context => getPlace(context, 'c50_ward', 'Ward');

const getCHNArea = context => getPlace(context, 'c60_chn_area', 'CHN Area');

const getFCHVArea = context => getPlace(context, 'c70_fchv_area', 'FCHV Area');

const getHousehold = context => {
  const houseNumber = faker.string.numeric({ length: 5 });
  const houseName = `${faker.location.city()}'s house (${houseNumber})`;
  return {
    type: 'contact',
    contact_type: 'c80_household',
    house_number: houseNumber,
    generated_name: houseName,
    generated_name_label: '',
    change_name: 'no',
    name: houseName,
    external_id: faker.string.alphanumeric(5),
    notes: faker.lorem.lines(2),
    place_id: faker.string.numeric({ length: 5 }),
    reported_date: faker.date
      .recent({ days: 20 })
      .getTime(),
  };
};

const getPerson = (context, { parent, sex = faker.person.sex(), ageRange = { min: 20, max: 60 } } = {}) => {
  const dobRaw = faker.date.birthdate({ mode: 'age', ...ageRange});
  const dobFormatted = `${dobRaw.getFullYear()}-${dobRaw.getMonth()}-${dobRaw.getDay()}`;
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    type: 'contact',
    contact_type: 'c82_person',
    fist_name: firstName,
    last_name: lastName,
    name: firstName + ' ' + lastName,
    add_phone: 'yes',
    phone: faker.helpers.fromRegExp(/[+]977[0-9]{8}/),
    date_of_birth: dobFormatted,
    gender: sex,
    religion: faker.helpers.arrayElement(['buddhist', 'muslim', 'christian', 'hindu']),
    marital_status: faker.helpers.arrayElement(['married', 'unmarried']),
    level_of_education: faker.helpers.arrayElement(['literate', 'phd', 'post_graduate', 'graduation_level']),
    is_disabled: faker.helpers.arrayElement(YES_NO),
    occupation: faker.helpers.arrayElement(['unemployed', 'heavy_load', 'painter', 'carpenter']),
    caste_code: faker.helpers.arrayElement(['janajati', 'brahmin', 'muslim', 'dalit']),
    relation: faker.helpers.arrayElement(['house_head', 'wife_husband', 'son_daughter', 'mother_father']),
    patient_id: faker.string.numeric({ length: 5 }),
    meta: {
      created_by: context.username,
    },
    reported_date: faker.date.recent({ days: 25 }).getTime(),
  };
};

const getDirectorOfCenter = (context, { parent }) => {
  return {
    ...getPerson(parent),
    post: 'director',
    contact_type: 'c12_center_contact',
  };
};

const getPublicOfficerOfProvince = (context, { parent }) => {
  return {
    ...getPerson(parent),
    post: 'pho',
    contact_type: 'c22_province_contact',
  };
};

const getStaffNurse = (context, { parent, contactType }) => {
  return {
    ...getPerson(parent),
    post: 'sn',
    contact_type: contactType,
  };
};

const getCommunityHealthOfficerOfMunicipality = (context, { parent }) => {
  return {
    ...getPerson(parent),
    post: 'sn',
    contact_type: 'c42_municipality_contact',
  };
};

const getCHWForFCHVArea = (context, { parent }) => {
  return {
    ...getPerson(parent),
    role: 'chw',
    fchv_id_number: faker.string.numeric({ length: 5 }),
    start_date_as_fchv: '2065', // Nepal calendar
    start_date_as_fchv_ad: '2070',
    basic_training: 'true',
    contact_type: 'c72_fchv_area_contact',
  };
};

const geHouseholdSurveyReport = (context, { parent, reportedDaysAgo = 9 }) => {
  return {
    form: 'household_survey',
    type: 'data_record',
    content_type: 'xml',
    reported_date: faker.date.recent({ days: reportedDaysAgo }).getTime(),
    from: faker.helpers.fromRegExp(/[+]2547[0-9]{8}/),
    fields: {
      patient_uuid: parent._id,
      patient_name: parent.name,
      consent_survey: {
        consent: 'agree',
      },
      household: {
        house_type: faker.helpers.arrayElement([ 'mud', 'cemented' ]),
        rented_house: faker.helpers.arrayElement([ 'rented', 'own' ]),
        drinking_water_source: 'piped hand_pump well',
        cooking_water_source: 'piped hand_pump well jar',
        washing_water_source: 'hand_pump well',
        purify_water: faker.helpers.arrayElement(YES_NO),
        toilet_type: 'flush_tank',
        distance_latrine_m: faker.number.int({ max: 30 }),
        has_kitchen_garden: faker.helpers.arrayElement(YES_NO),
        dispose_biodegradable: 'open compost',
        dispose_non_biodegradable: 'open burn',
        dispose_liquid_waste: 'kitchen_garden sewage',
        drainage_type: 'semi_closed',
        fuel_cooking: 'electricity lpg biogas',
        separate_kitchen: faker.helpers.arrayElement(YES_NO),
        has_smokestack: faker.helpers.arrayElement(YES_NO),
        bedrooms: faker.number.int({ max: 5 }),
      },
      helpless: {
        is_helpless: 'yes',
        type_helpless: 'no_means',
      },
      health_insurance: {
        insurance: 'no',
        time_reach_hf: 'min_30_60'
      },
      death: {
        member_deceased: 'no',
      },
      disease: {
        infected_last_year: 'yes',
        infected_count: faker.number.int({ max: 4 }),
      },
    }
  };
};

const getMentalHealthScreeningReport = (context, { patient, reportedDaysAgo = 9 }) => {
  const healthIssues1 = {
    changes_in_behavior: 'powerful_person talk_unnecessary audio_hallucination walk_around_dirty ' +
      'loss_of_interest_in_work insomnia anxiety_heart_palpitations rude body_ache stress_feeling' +
      ' other_signs_and_symptoms',
    serious_mental_problems: '',
    depression: '',
    anxiety_related_problem: '',
    serious_mental_problems_calc: '1',
    depression_calc: '1',
    alert_to_prevent_commit_suicide_calc: '0',
    anxiety_related_problem_calc: '1',
    epilepsy_disease_calc: '0',
    counseling_mental_health: '',
  };
  const healthIssues2 = {
    changes_in_behavior: 'audio_hallucination loss_of_interest_in_work insomnia thinking_future_is_dark ' +
      'getting_angry_quickly anxiety_heart_palpitations body_ache',
    depression: '',
    anxiety_related_problem: '',
    serious_mental_problems_calc: '0',
    depression_calc: '1',
    alert_to_prevent_commit_suicide_calc: '0',
    anxiety_related_problem_calc: '1',
    epilepsy_disease_calc: '0',
  };
  const healthIssues3 = {
    changes_in_behavior: 'powerful_person talk_unnecessary audio_hallucination walk_around_dirty ' +
      'loss_of_interest_in_work insomnia anxiety_heart_palpitations rude body_ache stress_feeling ' +
      'other_signs_and_symptoms',
    serious_mental_problems: '',
    depression: '',
    anxiety_related_problem: '',
    serious_mental_problems_calc: '1',
    depression_calc: '1',
    alert_to_prevent_commit_suicide_calc: '0',
    anxiety_related_problem_calc: '1',
    epilepsy_disease_calc: '0',
    counseling_mental_health: ''
  };

  return {
    form: 'mental_health_screening',
    type: 'data_record',
    content_type: 'xml',
    reported_date: faker.date.recent({ days: reportedDaysAgo }).getTime(),
    from: faker.helpers.fromRegExp(/[+]2547[0-9]{8}/),
    fields: {
      patient_uuid: patient._id,
      patient_name: patient.name,
      patient_id: patient._id,
      mental_health_screening: faker.helpers.arrayElement([ healthIssues1, healthIssues2, healthIssues3 ]),
    }
  };
};
const getNotCommunicableDiseasesReport = (context, { patient, reportedDaysAgo = 9 }) => {
  const takingMeds = faker.helpers.arrayElement(['yes_all', 'yes_some', 'no']);
  return {
    form: 'non_communicable_diseases',
    type: 'data_record',
    content_type: 'xml',
    reported_date: faker.date.recent({ days: reportedDaysAgo }).getTime(),
    from: faker.helpers.fromRegExp(/[+]2547[0-9]{8}/),
    fields: {
      patient_uuid: patient._id,
      patient_name: patient.name,
      patient_id: patient._id,
      non_communicable_diseases: {
        heart_disease: faker.helpers.arrayElement(YES_NO),
        high_blood_pressure: faker.helpers.arrayElement(YES_NO),
        diabetes: faker.helpers.arrayElement(YES_NO),
        copd: faker.helpers.arrayElement(YES_NO),
        cancer: faker.helpers.arrayElement(YES_NO),
        kidney_disease: faker.helpers.arrayElement(YES_NO),
        thyroid: faker.helpers.arrayElement(YES_NO),
        congenital_health: faker.helpers.arrayElement(YES_NO),
        has_other_ncd: 'no',
        taking_medicine: takingMeds,
        not_taking_medicine: takingMeds === 'yes_all' ? '' : faker.helpers.arrayElement(
          ['cured', 'not_prescribe', 'alternative', 'no_money']
        ),
      },
    }
  };
};

const getBreastCancerReport = (context, { patient, reportedDaysAgo = 9 }) => {
  return {
    form: 'breast_cancer',
    type: 'data_record',
    content_type: 'xml',
    reported_date: faker.date.recent({ days: reportedDaysAgo }).getTime(),
    from: faker.helpers.fromRegExp(/[+]2547[0-9]{8}/),
    fields: {
      patient_uuid: patient._id,
      patient_name: patient.name,
      patient_id: patient._id,
      bse_info_and_training: {
        different_testing_methods: '',
        bse_note: '',
        bse_training_yes_no: 'yes',
        wants_bse_info: {
          note: '',
          self_bse_test: 'yes'
        },
        bse_self_check: {
          bse_self_check_result: 'abdominal_discharge abnormal_breast_size_change',
          bse_check_refer: ''
        },
        bse_discussion: ''
      },
    },
  };
};

export default (context) => {
  return [
    {
      designId: 'place-center',
      amount: 1,
      getDoc: () => getCenter(context),
      children: [
        {
          designId: 'director',
          amount: 1,
          getDoc: ({ parent }) => {
            console.log(parent);
            return getDirectorOfCenter(context, { parent });
          },
        },
        {
          designId: 'place-province',
          amount: 1,
          getDoc: () => getProvince(context),
          children: [
            {
              designId: 'public-officer',
              amount: 1,
              getDoc: ({ parent }) => getPublicOfficerOfProvince(context, { parent }),
            },
            {
              designId: 'place-district',
              amount: 1,
              getDoc: () => getDistrict(context),
              children: [
                {
                  designId: 'staff-nurse-district',
                  amount: 1,
                  getDoc: ({ parent }) => getStaffNurse(
                    context, { parent, contactType: 'c32_district_contact' }
                  ),
                },
                {
                  designId: 'place-municipality',
                  amount: 1,
                  getDoc: () => getMunicipality(context),
                  children: [
                    {
                      designId: 'community-health-officer',
                      amount: 1,
                      getDoc: ({ parent }) => getCommunityHealthOfficerOfMunicipality(context, { parent }),
                    },
                    {
                      designId: 'place-ward',
                      amount: 1,
                      getDoc: () => getWard(context),
                      children: [
                        {
                          designId: 'staff-nurse-ward',
                          amount: 1,
                          getDoc: ({ parent }) => getStaffNurse(
                            context, { parent, contactType:'c52_ward_contact' },
                          ),
                        },
                        {
                          designId: 'place-chn-area',
                          amount: 1,
                          getDoc: () => getCHNArea(context),
                          children: [
                            {
                              designId: 'place-fchv-area',
                              amount: 1,
                              getDoc: () => getFCHVArea(context),
                              children: [
                                {
                                  designId: 'chw',
                                  amount: 1,
                                  getDoc: ({ parent }) => getCHWForFCHVArea(
                                    context, { parent },
                                  ),
                                },
                                {
                                  designId: 'place-household',
                                  amount: 1,
                                  getDoc: () => getHousehold(context),
                                  children: [
                                    {
                                      designId: 'hh-survey-report',
                                      amount: 1,
                                      getDoc: ({ parent }) => geHouseholdSurveyReport(context, { parent }),
                                    },
                                    {
                                      designId: 'place-person',
                                      amount: 1,
                                      getDoc: ({ parent }) => getPerson(context, { parent }),
                                      children: [
                                        {
                                          designId: 'mental-health-screening-report',
                                          amount: 2,
                                          getDoc: ({ parent }) => getMentalHealthScreeningReport(
                                            context, { patient: parent }
                                          ),
                                        },
                                        {
                                          designId: 'Breast-Cancer-Report',
                                          amount: 1,
                                          getDoc: ({ parent }) => getBreastCancerReport(
                                            context, { patient: parent }
                                          ),
                                        },
                                        {
                                          designId: 'Not-Communicable-Diseases-Report',
                                          amount: 1,
                                          getDoc: ({ parent }) => getNotCommunicableDiseasesReport(
                                            context, { patient: parent }
                                          ),
                                        },
                                      ]
                                    }
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];
};
