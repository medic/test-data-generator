import { faker } from '@faker-js/faker';

const YES_NO = [ 'yes', 'no' ];
const RELATIONSHIP = [ 'friend', 'sister', 'brother', 'mother', 'father' ];

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

export default (context) => {
  return [
    {
      amount: 1,
      getDoc: () => getACounty(context),
      children: [
        {
          amount: 2,
          getDoc: () => getSubCounty(context),
          children: [
            {
              amount: 3,
              getDoc: () => getPerson(context),
            },
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
                      getDoc: () => getHouseHold(context),
                      children: [
                        {
                          amount: 1,
                          getDoc: () => getHouseholdClient(context),
                        }
                      ],
                    }
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
