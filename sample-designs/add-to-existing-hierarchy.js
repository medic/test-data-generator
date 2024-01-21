import { faker } from '@faker-js/faker';

const YES_NO = [ 'yes', 'no' ];

const getPerson = (context, role) => {
  const dobRaw = faker.date.birthdate({ mode: 'age', min: 20, max: 60 });
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
    sex: faker.person.sex(),
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

const getPregnancyDangerSign = () => {
  return {
    form: 'pregnancy_danger_sign',
    type: 'data_record',
    content_type: 'xml',
    reported_date: faker.date.recent({ days: 5 }).getTime(),
    fields: {
      patient_age_in_years: 34,
      patient_name: 'Erick Loral',
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

const DISTRICT_HOSPITAL_UUID = 'ddd96eda-80f2-48c3-9636-d513e3358a50';
const PATIENT_UUID = '56bfecd7-7f14-4e74-8103-d227400b28ce';

export default (context) => {
  return [
    {
      id: 'chw-supervisor',
      amount: 1,
      getDoc: () => {
        return {
          ...getPerson(context, 'chw_supervisor'),
          parent: { _id: DISTRICT_HOSPITAL_UUID }
        };
      },
    },
    {
      id:'pregnancy-danger-report',
      amount: 1,
      getDoc: () => {
        return {
          ...getPregnancyDangerSign(),
          contact: { _id: PATIENT_UUID }
        };
      },
    }
  ];
};
