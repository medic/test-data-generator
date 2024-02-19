import { faker } from '@faker-js/faker';

const YES_NO = [ 'yes', 'no' ];

/*
 *  PLACES
 */

const getPlace = (context, { contactType, nameSuffix, parent }) => {
  const name = `${faker.location.city()}'s ${nameSuffix}`;
  return {
    type: 'contact',
    contact_type: contactType,
    membership_structure: faker.location.county(),
    name: name,
    name_auto: name,
    external_id: faker.string.alphanumeric(5),
    notes: faker.lorem.lines(2),
    place_id: faker.string.numeric({ length: 5 }),
    parent_place_id: parent?._id || '',
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

const getCentralLevel = context => getPlace(context, { contactType: 'ca10_central', nameSuffix: 'Central' });

const getRegionLevel = (context, { parent }) => {
  const REGIONS = [ 'savanes', 'kara', 'maritime', 'plateaux' ];
  const region = faker.helpers.arrayElements(REGIONS);
  return {
    ...getPlace(context, { contactType: 'cb20_region', nameSuffix: 'Region', parent }),
    region_selected_name: region,
    region_name_label: region,
  };
};

const getDistrictLevel = (context, { parent }) => {
  return {
    ...getPlace(context, { contactType: 'cc30_district', nameSuffix: 'District', parent }),
  };
};

const getCommuneLevel = (context, { parent }) => {
  return {
    ...getPlace(context, { contactType: 'cd40_commun', nameSuffix: 'Commune', parent }),
  };
};

const getAreaFollowUp = (context, { parent }) => {
  return {
    ...getPlace(context, { contactType: 'ce50_followup', nameSuffix: 'Area Follow Up', parent }),
  };
};

const getFormationSanitaire = (context, { parent }) => {
  return {
    ...getPlace(context, { contactType: 'cf60_sanitary', nameSuffix: 'Formation Sanitaire', parent }),
  };
};

const getSupervisionArea = (context, { parent }) => {
  return {
    ...getPlace(context, { contactType: 'cg70_supervision', nameSuffix: 'Supervision Area', parent }),
  };
};

const getVillage = (context, { parent }) => {
  return {
    ...getPlace(context, { contactType: 'ch80_village', nameSuffix: 'Village', parent }),
  };
};

const getCHWSite = (context, { parent }) => {
  return {
    ...getPlace(context, { contactType: 'ci90_chw_site', nameSuffix: 'CHW Site', parent }),
  };
};

const getHousehold = (context, { parent }) => {
  return {
    ...getPlace(context, { contactType: 'cj100_household', nameSuffix: 'Household', parent }),
    drinkable_water_point: faker.helpers.arrayElements(YES_NO),
    has_mousquito_net: faker.helpers.arrayElements(YES_NO),
    has_latrines: faker.helpers.arrayElements(YES_NO),
    geolocation: '8.069747 30.47227 0 0',
    is_name_generated: 'no',
  };
};

/*
 *  PEOPLE
 */
const getPerson = (context, { parent, contactType, role }) => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    type: 'contact',
    contact_type: contactType,
    fist_name: firstName,
    last_name: lastName,
    sex: 'female',
    name: firstName + ' ' + lastName,
    function: 'a function',
    phone: faker.string.numeric({ length: 10 }),
    email: faker.internet.email(),
    role: role,
    meta: {
      created_by: context.username,
    },
    reported_date: faker.date.recent({ days: 25 }).getTime(),
    patient_id: faker.string.numeric({ length: 5 }),
  };
};

const getPersonCentralLevel = (context) => {
  return {
    ...getPerson(context, { contactType: 'ca12_central', role: 'central_admin' }),
  };
};

const getPersonRegionLevel = (context, { parent }) => {
  const person = getPerson(context, { contactType: 'cb22_region', role: 'regional_admin' });
  return {
    ...person,
    membership_structure: parent.membership_structure,
    region_name: parent.region_name,
    admin_role: 'regional_admin',
    parent_name_selector: 'cb20_region',
    parent_name_label: parent.region_name_label,
    contact_place_name: person + '\'s ' + parent.region_name_label,
  };
};

const getPersonDistrictLevel = (context, { parent }) => {
  const person = getPerson(context, { contactType: 'cc32_district', role: 'district_admin' });
  return {
    ...person,
    membership_structure: parent.membership_structure,
    district_name: parent.region_name,
    admin_role: 'district_admin',
    parent_name_selector: 'cc30_district',
    parent_name_label: parent.name,
    contact_place_name: person + '\'s ' + parent.name,
  };
};

const getPersonCommuneLevel = (context, { parent }) => {
  const person = getPerson(context, { contactType: 'cd42_commun', role: '' });
  return {
    ...person,
    commun_name: parent.name,
    parent_name_selector: 'cd40_commun',
    parent_name_label: parent.name,
    contact_place_name: person + '\'s ' + parent.name,
  };
};

const getPersonAreaFollowUp = (context, { parent }) => {
  const person = getPerson(context, { contactType: 'ce52_followup', role: 'followup' });
  return {
    ...person,
    commun_name: parent.name,
    admin_role: 'followup',
    parent_name_selector: 'ce50_followup',
    parent_name_label: parent.name,
    contact_place_name: person + '\'s ' + parent.name,
    appartenance_ngo: 'An ONG',
  };
};

const getPersonFormationSanitaire = (context, { parent }) => {
  const person = getPerson(context, { contactType: 'cf62_sanitary', role: 'sanitary' });
  return {
    ...person,
    sanitary_area_name: parent.name,
    admin_role: 'sanitary',
    parent_name_selector: 'ce50_followup',
    parent_name_label: parent.name,
    contact_place_name: person + '\'s ' + parent.name,
  };
};

const getPersonSupervisionArea = (context, { parent }) => {
  const person = getPerson(context, { contactType: 'cg72_supervision', role: 'supervisor' });
  return {
    ...person,
    admin_role: 'supervisor',
    parent_name_selector: 'cg70_supervision',
    parent_name_label: parent.name,
    contact_place_name: person + '\'s ' + parent.name,
    appartenance_ngo: 'An ONG',
  };
};

const getPersonVillage = (context, { parent }) => {
  const person = getPerson(context, { contactType: 'ch82_village', role: '' });
  return {
    ...person,
    admin_role: '',
    village_name: parent.name,
    parent_name_selector: 'ch80_village',
    parent_name_label: parent.name,
    contact_place_name: person + '\'s ' + parent.name,
  };
};

const getPersonCHWSite = (context, { parent }) => {
  const person = getPerson(context, { contactType: 'ci92_chw_site', role: 'chw' });
  return {
    ...person,
    agent_type: 'chw',
    occupation: 'household',
    age: faker.number.int({ min: 4, max: 70 }).toString(),
    education: 'secondary',
    parent_name_selector: 'ci90_chw_site',
    parent_name_label: parent.name,
    contact_place_name: person + '\'s ' + parent.name,
  };
};

const getPersonHousehold = (context, { parent }) => {
  const person = getPerson(context, { contactType: 'cj102_household', role: '' });
  const dob = new Date();
  const age = faker.number.int({ min: 19, max: 70 });
  dob.setFullYear(dob.getFullYear() - age);
  return {
    ...person,
    age: age.toString(),
    date_of_birth: `${dob.getFullYear()}-${dob.getMonth() + 1}-${dob.getDate()}`,
    education: 'secondary',
    household_last_name: person.last_name,
    household_first_name: person.fist_name,
    sex_household: 'female',
    parent_name_selector: 'cj102_household',
    parent_name_label: parent.name,
    contact_place_name: person + '\'s ' + parent.name,
  };
};

/*
 *  REPORTS
 */

const getAssessmentOverFiveReport = (context, { patient, reportedDaysAgo = 1 }) => {
  const today = new Date();
  return {
    form: 'patient_assessment_over_5',
    type: 'data_record',
    content_type: 'xml',
    reported_date: faker.date.recent({ days: reportedDaysAgo }).getTime(),
    from: faker.string.numeric({ length: 10 }),
    contact: patient,
    fields: {
      inputs: { contact: patient },
      household_id: patient.parent._id,
      chw_site_id: patient.parent.parent._id,
      village_id: patient.parent.parent.parent._id,
      patient_uuid: patient._id,
      patient_name: patient.name,
      patient_first_name: patient.first_name,
      patient_last_name: patient.last_name,
      patient_id: patient._id,
      patient_sex_en: patient.sex,
      visited_contact_uuid: patient.parent._id,
      is_pregnant_in_cht: 'false',
      is_patient_pregnant: 'no',
      has_fever: faker.helpers.arrayElements(YES_NO),
      has_tb_signs: faker.helpers.arrayElements(YES_NO),
      need_reference: faker.helpers.arrayElements(YES_NO),
      next_referral_followup_date: `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`,
      next_treatment_followup_date: `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`,
      has_any_complaints: 'no',
      g_assessment_time: { s_assessment_time: 'noon_time' },
      g_assessment_realization: { s_how_was_patient_found: 'during_home_visit' },
      g_pregnant_woman: { s_pregnant_or_suspicious: 'no' },
      g_danger_signs: {
        s_danger_sign_coughing_and_difficulty_breathing: faker.helpers.arrayElements(YES_NO),
        s_danger_sign_persistent_cough_over_2_weeks: faker.helpers.arrayElements(YES_NO),
        s_danger_sign_blood_stained_sputum: faker.helpers.arrayElements(YES_NO),
        s_danger_sign_visible_weight_loss: faker.helpers.arrayElements(YES_NO),
        s_danger_sign_persistent_fever_over_3_weeks: faker.helpers.arrayElements(YES_NO),
        s_danger_sign_convulsions_during_illness: faker.helpers.arrayElements(YES_NO),
        s_danger_sign_retinal_hemorrhage: faker.helpers.arrayElements(YES_NO),
        s_danger_sign_generalized_weakness: faker.helpers.arrayElements(YES_NO),
        s_danger_sign_loss_of_consciousness: faker.helpers.arrayElements(YES_NO),
        has_danger_sign: 'yes',
      },
      g_complaints: {
        s_complaints_fever: faker.helpers.arrayElements(YES_NO),
        s_complaints_coughing: faker.helpers.arrayElements(YES_NO),
        s_complaints_diarrhea: faker.helpers.arrayElements(YES_NO),
        s_complaints_other: 'no'
      },
      g_constant: { s_have_thermometer: faker.helpers.arrayElements(YES_NO) },
    },
  };
};

const getFPDistributionReport = (context, { patient, reportedDaysAgo = 1 }) => {
  const today = new Date();
  const nextReferralDate = new Date();
  nextReferralDate.setMonth(today.getMonth() + 3);
  return {
    form: 'fp_distribution',
    type: 'data_record',
    content_type: 'xml',
    reported_date: faker.date.recent({ days: reportedDaysAgo }).getTime(),
    from: faker.string.numeric({ length: 10 }),
    contact: patient,
    fields: {
      inputs: { contact: patient },
      household_id: patient.parent._id,
      chw_site_id: patient.parent.parent._id,
      village_id: patient.parent.parent.parent._id,
      patient_uuid: patient._id,
      patient_name: patient.name,
      patient_first_name: patient.first_name,
      patient_last_name: patient.last_name,
      patient_id: patient._id,
      patient_sex_en: patient.sex,
      has_reference: 'yes',
      referral_date: `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`,
      next_90_days:
        `${nextReferralDate.getDate()}/${nextReferralDate.getMonth() + 1}/${nextReferralDate.getFullYear()}`,
      g_client_registration: { done_today: 'yes' },
      eval_date_cmp: `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`,
      g_patient_found: { how_patient_found: 'during_home_visit' },
      g_risk_pregnancy: {
        risk_pregnancy_delivery_less_6_months: 'yes',
        risk_pregnancy_abstaine_sexual: 'yes',
        risk_pregnancy_gave_birth_last_4_weeks: 'yes',
        risk_pregnancy_lmp_last_7days: 'yes',
        risk_pregnancy_had_abortion: faker.helpers.arrayElements(YES_NO),
        risk_pregnancy_using_contraceptive: faker.helpers.arrayElements(YES_NO),
        risk_pregnancy: 'true'
      },
      g_2nd_check: {
        contraindications_severe_headaches: faker.helpers.arrayElements(YES_NO),
        contraindications_jaudice: faker.helpers.arrayElements(YES_NO),
        contraindications_chest_pains: 'yes',
        contraindications_swelling: faker.helpers.arrayElements(YES_NO),
        contraindications_period_late: faker.helpers.arrayElements(YES_NO),
        contraindications_legs_swollen: faker.helpers.arrayElements(YES_NO),
        contraindications_high_blood_pressure: 'yes',
        contraindications_tuberculosis_treatment: faker.helpers.arrayElements(YES_NO),
        contraindications_diabetes: faker.helpers.arrayElements(YES_NO),
        contraindications: 'true'
      },
      g_contraindications_exist: {},
      g_health_centre_visit: {
        visit_health_centre_date: `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`,
      },
      ci90_chw_site_id: patient.parent.parent._id,
      prescription_summary: {
        stock_monitoring_reported_date: today.toISOString(),
        place_id: patient.parent.parent._id,
        type: 'data_record',
        content_type: 'xml',
        form: 'prescription_summary',
        contact: patient.parent.parent,
        fields: {
          male_condom_used_in_fp_distribution: '0',
          female_condom_used_in_fp_distribution: '0',
          exluton_used_in_fp_distribution: '0',
          microgynon_used_in_fp_distribution: '0'
        }
      },
    },
  };
};

const getPregnancyReport = (context, { patient, reportedDaysAgo = 1 }) => {
  const today = new Date();
  const deliveryDate = new Date();
  deliveryDate.setMonth(deliveryDate.getMonth() + 1);
  const reportedDate = faker.date.recent({ days: reportedDaysAgo });
  return {
    form: 'pregnancy_registration',
    type: 'data_record',
    content_type: 'xml',
    reported_date: reportedDate.getTime(),
    from: faker.string.numeric({ length: 10 }),
    contact: patient,
    fields: {
      inputs: { contact: patient },
      household_id: patient.parent._id,
      chw_site_id: patient.parent.parent._id,
      village_id: patient.parent.parent.parent._id,
      patient_uuid: patient._id,
      patient_name: patient.name,
      patient_first_name: patient.first_name,
      patient_last_name: patient.last_name,
      patient_id: patient._id,
      patient_sex_en: patient.sex,
      assessment_date: `${reportedDate.getDate()}/${reportedDate.getMonth() + 1}/${reportedDate.getFullYear()}`,
      is_vaccin_update: faker.helpers.arrayElements(YES_NO),
      next_followup_date: `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`,
      estimated_delivery_date_cal:
        `${deliveryDate.getDate()}/${deliveryDate.getMonth() + 1}/${deliveryDate.getFullYear()}`,
      g_patient_found: {
        how_was_patient_found: 'during_home_visit'
      },
      g_pregnancy_confirmation: {
        has_followup_book: 'yes',
        estimated_delivery_date:
          `${deliveryDate.getDate()}/${deliveryDate.getMonth() + 1}/${deliveryDate.getFullYear()}`,
      },
      g_prenatal_visits: {
        has_done_prenatal_visit: 'no',
        plan_prenatal_visit_date:
          `${reportedDate.getFullYear()}/${reportedDate.getMonth() + 1}/${reportedDate.getDate()}`,
      },
      g_vaccinal_state: {
        has_been_vaccinated: 'no',
        td_date: `${reportedDate.getFullYear()}/${reportedDate.getMonth() + 1}/${reportedDate.getDate()}`,
      },
      g_advice_pregnant: {},
      g_advise_during_pregnancy: {},
      g_advice_transmission_child: {},
      plan_prenatal_visit_date_cal:
        `${deliveryDate.getDate()}/${deliveryDate.getMonth() + 1}/${deliveryDate.getFullYear()}`,
    },
  };
};

export default (context) => {
  return [
    {
      designId: 'Central-Level',
      amount: 1,
      getDoc: () => getCentralLevel(context),
      children: [
        {
          designId: 'Person-Central-Level',
          amount: 1,
          getDoc: ({ parent }) => {
            console.log(parent);
            return getPersonCentralLevel(context);
          },
        },
        {
          designId: 'Region-Level',
          amount: 1,
          getDoc: ({ parent }) => getRegionLevel(context, { parent }),
          children: [
            {
              designId: 'Person-Region-Level',
              amount: 1,
              getDoc: ({ parent }) => getPersonRegionLevel(context, { parent }),
            },
            {
              designId: 'District-Level',
              amount: 1,
              getDoc: ({ parent }) => getDistrictLevel(context, { parent }),
              children: [
                {
                  designId: 'Person-District-Level',
                  amount: 1,
                  getDoc: ({ parent }) => getPersonDistrictLevel(context, { parent }),
                },
                {
                  designId: 'Commune-Level',
                  amount: 1,
                  getDoc: ({ parent }) => getCommuneLevel(context, { parent }),
                  children: [
                    {
                      designId: 'Person-Commune-Level',
                      amount: 1,
                      getDoc: ({ parent }) => getPersonCommuneLevel(context, { parent }),
                    },
                    {
                      designId: 'Area-Follow-Up',
                      amount: 1,
                      getDoc: ({ parent }) => getAreaFollowUp(context, { parent }),
                      children: [
                        {
                          designId: 'Person-Area-Follow-Up',
                          amount: 1,
                          getDoc: ({ parent }) => getPersonAreaFollowUp(context, { parent }),
                        },
                        {
                          designId: 'Formation-Sanitaire',
                          amount: 1,
                          getDoc: ({ parent }) => getFormationSanitaire(context, { parent }),
                          children: [
                            {
                              designId: 'Person-Formation-Sanitaire',
                              amount: 1,
                              getDoc: ({ parent }) => getPersonFormationSanitaire(context, { parent }),
                            },
                            {
                              designId: 'Supervision-Area',
                              amount: 1,
                              getDoc: ({ parent }) => getSupervisionArea(context, { parent }),
                              children: [
                                {
                                  designId: 'Person-Supervision-Area',
                                  amount: 1,
                                  getDoc: ({ parent }) => getPersonSupervisionArea(context, { parent }),
                                },
                                {
                                  designId: 'Village',
                                  amount: 1,
                                  getDoc: ({ parent }) => getVillage(context, { parent }),
                                  children: [
                                    {
                                      designId: 'Person-Village',
                                      amount: 1,
                                      getDoc: ({ parent }) => getPersonVillage(context, { parent }),
                                    },
                                    {
                                      designId: 'CHW-Site',
                                      amount: 1,
                                      getDoc: ({ parent }) => getCHWSite(context, { parent }),
                                      children: [
                                        {
                                          designId: 'Person-CHW-Site',
                                          amount: 4,
                                          getDoc: ({ parent }) => getPersonCHWSite(context, { parent }),
                                        },
                                        {
                                          designId: 'Household',
                                          amount: 110,
                                          getDoc: ({ parent }) => getHousehold(context, { parent }),
                                          children: [
                                            {
                                              designId: 'Person-House-hold',
                                              amount: 8,
                                              getDoc: ({ parent }) => getPersonHousehold(context, { parent }),
                                              children: [
                                                {
                                                  designId: 'Assessment-Over-Five-Report',
                                                  amount: 2,
                                                  getDoc: ({ parent }) => getAssessmentOverFiveReport(
                                                    context, { patient: parent }
                                                  ),
                                                },
                                                {
                                                  designId: 'Pregnancy-Report',
                                                  amount: 1,
                                                  getDoc: ({ parent }) => getPregnancyReport(
                                                    context, { patient: parent }
                                                  ),
                                                },
                                                {
                                                  designId: 'FP-Distribution-Report',
                                                  amount: 2,
                                                  getDoc: ({ parent }) => getFPDistributionReport(
                                                    context, { patient: parent }
                                                  ),
                                                }
                                              ],
                                            },
                                          ],
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
