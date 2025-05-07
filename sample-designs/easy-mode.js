import { faker } from '@faker-js/faker';
import { DateTime } from 'luxon';
import { getUserDesigns } from './users.js';

const YES_NO = [ 'yes', 'no' ];
const DATE_FORMAT = 'yyyy-MM-dd';

const getPlace = (context, type, nameSuffix) => {
  return {
    type,
    name: `${faker.location.city()}'s ${nameSuffix}`,
    external_id: faker.string.alphanumeric(5),
    notes: faker.lorem.lines(2),
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

const getDistrictHospital = context => getPlace(context, 'district_hospital', 'Hospital');
const getHealthCenter = context => getPlace(context, 'health_center', 'Health Center');
const getHousehold = context => getPlace(context, 'clinic', 'Household');

const getPerson = (context, role, { sex = faker.person.sex(), ageRange = { min: 20, max: 60 } } = {}) => {
  const dobRaw = DateTime.fromJSDate(faker.date.birthdate({ mode: 'age', ...ageRange}));
  const dobFormatted = dobRaw.toFormat(DATE_FORMAT);
  return {
    type: 'person',
    patient_id: faker.string.numeric(10),
    name: faker.person.fullName(),
    short_name: faker.person.middleName(),
    date_of_birth: dobFormatted,
    date_of_birth_method: '',
    ephemeral_dob: {
      dob_calendar: dobFormatted,
      dob_method: '',
      dob_approx: dobRaw.toISO(),
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

const getUser = (context, role) => {
  const person = getPerson(context, role);
  person.username = faker.internet.userName().toLowerCase();
  return person;
};

const getTargetDocument = (context, contact, period) => {
  if (!period) {
    const now = DateTime.now();
    period = now.toFormat('yyyy-MM');
  }

  const targets = [
    'deaths-this-month',
    'pregnancy-registrations-this-month',
    'births-this-month',
    'active-pregnancies',
    'active-pregnancies-1+-visits',
    'facility-deliveries',
    'active-pregnancies-4+-visits',
    'active-pregnancies-8+-contacts'
  ];

  return {
    _id: `target~${period}~${contact._id}~org.couchdb.user:${context.username}`,
    type: 'target',
    user: `org.couchdb.user:${context.username}`,
    owner: contact._id,
    reporting_period: period,
    targets: targets.map(target => ({
      id: target,
      value: {
        pass: faker.number.int({ min: 0, max: 10 }),
        total: faker.number.int({ min: 0, max: 10 }),
      }
    })),
  };
};

const getPatient = context => getPerson(context, 'patient');
const getWoman = context => getPerson(
  context,
  'patient',
  {
    sex: 'female',
    ageRange: { min: 15, max: 45 }
  });
const getChild = context => getPerson(
  context,
  'patient',
  {
    ageRange: { min: 1, max: 14 }
  });
const getInfant = context => getPerson(
  context,
  'patient',
  {
    ageRange: { min: 0, max: 1 }
  });


const getPregnancyDangerSign = (patient) => {
  return {
    form: 'pregnancy_danger_sign',
    type: 'data_record',
    content_type: 'xml',
    reported_date: faker.date.recent({ days: 5 }).getTime(),
    fields: {
      patient_age_in_years: 34,
      patient_name: patient.name,
      patient_id: patient.patient_id,
      t_danger_signs_referral_follow_up_date: faker.date.recent({ days: 5 }).toISOString(),
      t_danger_signs_referral_follow_up: 'yes', // Intentionally 'yes'
      danger_signs: {
        danger_signs_note: '',
        danger_signs_question_note: '',
        vaginal_bleeding: 'yes', // Intentionally 'yes'
        fits: faker.helpers.arrayElement(YES_NO),
        severe_abdominal_pain: faker.helpers.arrayElement(YES_NO),
        severe_headache: faker.helpers.arrayElement(YES_NO),
        very_pale: faker.helpers.arrayElement(YES_NO),
        fever: faker.helpers.arrayElement(YES_NO),
        reduced_or_no_fetal_movements: faker.helpers.arrayElement(YES_NO),
        breaking_water: faker.helpers.arrayElement(YES_NO),
        easily_tired: faker.helpers.arrayElement(YES_NO),
        face_hand_swelling: faker.helpers.arrayElement(YES_NO),
        breathlessness: faker.helpers.arrayElement(YES_NO),
        r_danger_sign_present: faker.helpers.arrayElement(YES_NO),
        refer_patient_note_1: '',
        refer_patient_note_2: '',
      },
    },
  };
};


const deathReport = (patient) => {
  return {
    form: 'death_report',
    type: 'data_record',
    content_type: 'xml',
    reported_date: faker.date.recent({ days: 5 }).getTime(),
    fields: {
      patient_name: patient.name,
      patient_id: patient.patient_id,
      death_details: {
        date_of_death: faker.date.recent({ days: 5 }).toISOString(),
        place_of_death: 'home',
        death_information: '',
      },
    },
  };
};

const pregnancyRegistration = (patient, due = false) => {
  const lmpRaw = faker.date.recent({ days: due ? 400 : 120 });
  const lmp = DateTime.fromJSDate(lmpRaw);
  const edd = DateTime.fromJSDate(lmpRaw).plus({ weeks: 42 });

  return {
    form: 'pregnancy',
    type: 'data_record',
    content_type: 'xml',
    reported_date: faker.date.recent({ days: 30 }).getTime(),
    fields: {
      patient_age_in_years: 34,
      patient_name: patient.name,
      patient_id: patient.patient_id,
      group_lmp: {
        g_lmp_method: 'calendar',
        g_lmp_calendar: lmp.toFormat(DATE_FORMAT),
        g_lmp_approx: null,
        g_lmp_date_raw: lmp.toFormat(DATE_FORMAT),
        g_lmp_date_8601: lmp.toFormat(DATE_FORMAT),
        g_lmp_date: lmp.toFormat(DATE_FORMAT),
        g_edd_8601: edd.toISO(),
        g_edd: edd.toFormat('MMM dd, yyyy'),
      },
      group_llin_parity: {
        patient_llin: 'no'
      },
      group_anc_visit: {
        anc_visit: 'no',
        anc_visit_repeat: null,
        prophylaxis_taken: 'no',
        last_dose: null,
        last_dose_date: null,
        tt_imm: 'no',
        tt_received: null,
        tt_date: null,
        given_mebendazole: 'no'
      },
      g_nutrition_screening: {
        muac_score: 7478903295705088,
        mother_weight: 8257856090406912,
        last_fed: '6',
        last_food: [
          [
            'milk'
          ]
        ],
        mother_hiv_status: 'o',
        mother_arv: null
      },
      group_risk_factors: {
        gravida: 1,
        parity: 1,
        g_risk_factors: [
          'r8'
        ]
      },
      group_danger_signs: {
        g_danger_signs: [
          'd8',
          'd3',
          'd7',
          'd2'
        ]
      },
      lmp_method: 'calendar',
      lmp_date_8601: lmp.toFormat(DATE_FORMAT),
      lmp_date: lmp.toFormat(DATE_FORMAT),
      edd_8601: edd.toISO(),
      edd: edd.toFormat('MMM dd, yyyy'),
      risk_factors: [
        'r8'
      ],
      danger_signs: [
        'd8',
        'd3',
        'd7',
        'd2'
      ],
      anc_visit_identifier: '',
      anc_last_bp_reading: '',
      patient_age_at_lmp: 34,
      days_since_lmp: 40,
      weeks_since_lmp: 4
    },
  };
};

const getPNCDangerSignFollowUpBaby = (patient) => {
  return {
    form: 'pnc_danger_sign_follow_up_baby',
    type: 'data_record',
    content_type: 'xml',
    reported_date: faker.date.recent({ days: 5 }).getTime(),
    fields: {
      patient_age_in_years: 32,
      patient_uuid: patient._id,
      patient_id: patient.patient_id,
      patient_name: patient.name,
      t_danger_signs_referral_follow_up_date: faker.date.recent({ days: 5 }).toISOString(),
      t_danger_signs_referral_follow_up: 'yes',
      danger_signs: {
        visit_confirm: 'yes',
        danger_sign_present: 'yes',
        danger_signs_question_note: '',
        infected_umbilical_cord: faker.helpers.arrayElement(YES_NO),
        convulsion: faker.helpers.arrayElement(YES_NO),
        difficulty_feeding: faker.helpers.arrayElement(YES_NO),
        vomit: faker.helpers.arrayElement(YES_NO),
        drowsy: faker.helpers.arrayElement(YES_NO),
        stiff: faker.helpers.arrayElement(YES_NO),
        yellow_skin: faker.helpers.arrayElement(YES_NO),
        fever: faker.helpers.arrayElement(YES_NO),
        blue_skin: faker.helpers.arrayElement(YES_NO),
        r_danger_sign_present: 'yes',
        congratulate_no_ds_note: '',
        refer_patient_note_1: '',
        refer_patient_note_2: ''
      }
    }
  };
};

const getPregnancyHomeVisit = (patient) => {
  const lmpRaw = faker.date.recent({ days: 200 });
  const lmp = DateTime.fromJSDate(lmpRaw);
  const edd = DateTime.fromJSDate(lmpRaw).plus({ weeks: 42 });
  
  return {
    form: 'pregnancy_home_visit',
    type: 'data_record',
    content_type: 'xml',
    reported_date: faker.date.recent({ days: 5 }).getTime(),
    fields: {
      patient_age_in_years: 43,
      patient_uuid: patient._id,
      patient_id: patient.patient_id,
      patient_name: patient.name,
      patient_short_name: '',
      patient_short_name_start: '',
      lmp_date_8601: lmp.toFormat(DATE_FORMAT),
      edd_8601: edd.toFormat(DATE_FORMAT),
      days_since_lmp: lmp.diff(DateTime.now(), 'days').days,
      weeks_since_lmp: lmp.diff(DateTime.now(), 'weeks').weeks,
      weeks_since_lmp_rounded: lmp.diff(DateTime.now(), 'weeks').weeks,
      lmp_method_approx: 'approx',
      lmp_updated: faker.helpers.arrayElement(YES_NO),
      t_pregnancy_follow_up_date: faker.date.recent({ days: 5 }).toISOString(),
      t_pregnancy_follow_up: faker.helpers.arrayElement(YES_NO),
      t_danger_signs_referral_follow_up_date: faker.date.recent({ days: 5 }).toISOString(),
      t_danger_signs_referral_follow_up: faker.helpers.arrayElement(YES_NO),
      hiv_status_known: faker.helpers.arrayElement(YES_NO),
      tt_received: faker.helpers.arrayElement(YES_NO),
      deworming_med_received: faker.helpers.arrayElement(YES_NO),
      anc_visits_hf: {
        anc_visits_hf_past: {
          pregnancy_follow_up_date_recent: faker.date.recent({ days: 5 }).toISOString(),
          last_visit_attended: faker.helpers.arrayElement(YES_NO),
          report_other_visits: faker.helpers.arrayElement(YES_NO),
          visited_hf_count: faker.helpers.rangeToNumber(3),
          visited_date_ask_single: faker.helpers.arrayElement(YES_NO),
          visited_date_single: faker.helpers.arrayElement(YES_NO),
          visited_dates_count: faker.helpers.rangeToNumber(3),
          visited_dates: {
            visited_date_ask_multiple: faker.helpers.arrayElement(YES_NO),
            visited_date: faker.date.recent({ days: 5 }).toISOString(),
          }
        },
        risk_factors: {
          new_risks: faker.helpers.arrayElement(YES_NO),
          additional_risk_check: faker.helpers.arrayElement(YES_NO),
          additional_risk: faker.helpers.arrayElement(YES_NO),
          r_risk_factor_present: faker.helpers.arrayElement(YES_NO),
        },
        anc_visits_hf_next: {
          anc_next_visit_date: {
            appointment_date_known: faker.helpers.arrayElement(YES_NO),
            appointment_date: {}
          },
        }
      },
      danger_signs: {
        vaginal_bleeding: faker.helpers.arrayElement(YES_NO),
        fits: faker.helpers.arrayElement(YES_NO),
        severe_abdominal_pain: faker.helpers.arrayElement(YES_NO),
        severe_headache: faker.helpers.arrayElement(YES_NO),
        very_pale: faker.helpers.arrayElement(YES_NO),
        fever: faker.helpers.arrayElement(YES_NO),
        reduced_or_no_fetal_movements: faker.helpers.arrayElement(YES_NO),
        breaking_water: faker.helpers.arrayElement(YES_NO),
        easily_tired: faker.helpers.arrayElement(YES_NO),
        face_hand_swelling: faker.helpers.arrayElement(YES_NO),
        breathlessness: faker.helpers.arrayElement(YES_NO),
        r_danger_sign_present: faker.helpers.arrayElement(YES_NO),
      },
      safe_pregnancy_practices: {
        malaria: {
          llin_use: faker.helpers.arrayElement(YES_NO),
        },
        iron_folate: {
          iron_folate_daily: faker.helpers.arrayElement(YES_NO),
        },
        deworming: {
          deworming_med: faker.helpers.arrayElement(YES_NO),
        },
        hiv_status: {
          hiv_tested: faker.helpers.arrayElement(YES_NO),
        },
        tetanus: {
          tt_imm_received: faker.helpers.arrayElement(YES_NO),
        },
        safe_pregnancy_practices: faker.helpers.arrayElement(YES_NO),
      }
    }
  };
};

export default (context) => {
  return [
    {
      designId: 'district-hospital',
      amount: 5,
      getDoc: () => getDistrictHospital(context),
      children: [
        {
          designId: 'supervisor',
          amount: 1,
          getDoc: () => getUser(context, 'chw_supervisor'),
          children: [
            {
              designId: 'target',
              amount: 1,
              getDoc: ({ parent }) => getTargetDocument(context, parent),
            },
            ...getUserDesigns({
              roles: ['chw_supervisor'],
              context
            }),
          ]
        },
        {
          designId: 'health-center',
          amount: 10,
          getDoc: () => getHealthCenter(context),
          children: [
            {
              designId: 'chw',
              amount: 1,
              getDoc: () => getUser(context, 'chw'),
              children: [
                {
                  designId: 'target',
                  amount: 1,
                  getDoc: ({ parent }) => getTargetDocument(context, parent),
                },
                ...getUserDesigns({
                  roles: ['chw'],
                  context
                }),
              ]
            },
            {
              designId: 'household',
              amount: 20,
              getDoc: () => getHousehold(context),
              children: [
                {
                  designId: 'woman-person',
                  amount: 1,
                  getDoc: () => getWoman(context),
                  children: [
                    {
                      designId: 'pregnancy-report',
                      amount: 1,
                      getDoc: ({parent}) => pregnancyRegistration(parent),
                    },
                    {
                      designId: 'pregnancy-home-visit',
                      amount: 1,
                      getDoc: ({parent}) => getPregnancyHomeVisit(parent),
                    }
                  ]
                },
                {
                  designId: 'woman-person',
                  amount: 1,
                  getDoc: () => getWoman(context),
                  children: [
                    {
                      designId: 'pregnancy-danger-report',
                      amount: 1,
                      getDoc: ({parent}) => getPregnancyDangerSign(parent),
                    },
                    {
                      designId: 'pregnancy-report',
                      amount: 1,
                      getDoc: ({parent}) => pregnancyRegistration(parent, true),
                    },

                  ]
                },
                {
                  designId: 'child-person',
                  amount: 2,
                  getDoc: () => getChild(context),
                },
                {
                  designId: 'infant-person',
                  amount: 1,
                  getDoc: () => getInfant(context),
                  children: [
                    {
                      designId: 'pnc_danger_sign_follow_up_baby-report',
                      amount: 1,
                      getDoc: ({parent}) => getPNCDangerSignFollowUpBaby(parent),
                    },
                  ]
                },
                {
                  designId: 'patient-person',
                  amount: 2,
                  getDoc: () => getPatient(context),
                },
                {
                  designId: 'patient-person',
                  amount: 1,
                  getDoc: () => getPatient(context),
                  children: [
                    {
                      designId: 'death-report',
                      amount: 1,
                      getDoc: ({parent}) => deathReport(parent),
                    }
                  ]
                }
              ]
            },
          ]
        },
      ]
    },
  ];
};
