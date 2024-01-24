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

const addFamilyToHouseholds = (context, householdIds) => {
  return householdIds.map(householdId => {
    return {
      amount: 1,
      getDoc: () => {
        return {
          ...getHouseholdClient(context),
          parent: {
            _id: householdId,
            parent: {
              _id: 'ba0016ce-18a9-4d57-949a-9c14c2040fe8',
              parent: {
                _id: 'cce35f62-1914-4598-bdd1-736b5bd0a45a',
                parent: {
                  _id: '48f92c12-f0a1-4d95-8f9f-6d65588995e7',
                  parent: {
                    _id: '74d53432-9206-4a2a-aeb7-6e4b96349af0'
                  }
                }
              }
            }
          },
        };
      }
    };
  });
};

const getSexualGenderViolenceReport = (context, patientID, reportedDaysAgo=5) => {
  return {
    form: 'sgbv',
    type: 'data_record',
    content_type: 'xml',
    reported_date: faker.date.recent({ days: reportedDaysAgo }).getTime(),
    contact: { _id: patientID },
    from: faker.helpers.fromRegExp(/[+]2547[0-9]{8}/),
    fields: {
      patient_uuid: patientID,
      patient_id: patientID,
      sgbv: {
        sgbv_observe_note: faker.lorem.words(),
        has_observed_sgbv_signs: faker.helpers.arrayElement(YES_NO),
        sgbv_signs_observed: faker.lorem.words(),
        is_referred_to_cha: 'yes'
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
    ...addFamilyToHouseholds(context, [
      '5933ff98-0dbb-4987-965f-51409d253cf3',
    ]),
    ...addReportsToPatient(context, [
      '13e9f85d-1fc3-4efc-8f89-aae1abd3f82d'
    ]),
    /*...addReportsToPatient(context, [
      '7e19ec80-14f1-4429-9333-8114d3d24d83',
      '21de087d-3e80-4401-b29f-28a51229d8a0',
      '10560256-1a34-430e-b2b0-ed4ef0785ffe',
      '376d74f3-e8e3-4657-b400-0d9e2bd4f6a9',
      '7c379022-278d-4450-ba7d-fdaf8cb54ed2',
      '741c9294-e59b-46cf-9c3f-cff8a47e4295',
    ]),
    ...addReportsToPatient(context, [
      '7e19ec80-14f1-4429-9333-8114d3d24d83',
      '21de087d-3e80-4401-b29f-28a51229d8a0',
      '10560256-1a34-430e-b2b0-ed4ef0785ffe',
      '376d74f3-e8e3-4657-b400-0d9e2bd4f6a9',
      '7c379022-278d-4450-ba7d-fdaf8cb54ed2',
      '741c9294-e59b-46cf-9c3f-cff8a47e4295',
    ], 270),
    ...addReportsToPatient(context, [
      '7e19ec80-14f1-4429-9333-8114d3d24d83',
      '21de087d-3e80-4401-b29f-28a51229d8a0',
      '10560256-1a34-430e-b2b0-ed4ef0785ffe',
      '376d74f3-e8e3-4657-b400-0d9e2bd4f6a9',
      '7c379022-278d-4450-ba7d-fdaf8cb54ed2',
      '741c9294-e59b-46cf-9c3f-cff8a47e4295',
    ], 270)*/
    // addHierarchyAndCHPWithHouseholds(context),
    // var arr = [];
    // $('.card.children.places mm-content-row li').each((i, elem) => arr.push(elem.getAttribute('data-record-id')))
    // copy(arr);
    /*...addFamilyToHouseholds(context, [
      // 'ff9dc805-1f7b-47fd-89ed-ad36a02f80d8',
      // 'b7c4487f-f8b7-41c0-a6fc-c5fa362219c9',
      '7c83cd7f-788f-48d5-9a5f-e2407426273a',
      '759ac5ab-b173-4972-8c20-fe852ccb979c',
      'fd45109b-86de-41d7-82e8-273c768cefa0',
      '6597c4d4-f9d8-48be-984f-f3a6cfe59296',
      'e2516655-7266-4c1c-a0dd-00d2f565e1bd',
      '608250c1-4949-4ea4-9441-2ff394a0be63',
      '979a90f0-a6e6-491f-b161-06d697135014',
      '6e829e6b-36d1-4867-93d0-6ae8ae8b8e3e',
      'f8b26991-b2fc-4f0d-b837-e41c9aafe1f1',
      '0f165cc9-940a-4088-b687-626ee593dc4f',
      '3bf27180-8a8e-4207-84d6-4b95cb22d5b0',
      '3179f806-e1a3-4d57-b8b6-eddf343a882e',
      '2c8b5c1d-f32b-4332-a2ca-442ee7fe2967',
      '1a902594-f017-4450-8671-101d0d0b19fa',
      'f809c870-7c09-45c8-ab9f-c7b9bc95c7af',
      '1b256d96-28e0-4e5e-a531-2541da39cbf8',
      '1b48ef4a-7ca7-44c4-999b-9f78638eac7f',
      '42040658-a937-4954-9a80-bd943679c1fc',
      'cbdffb14-cb23-4271-a515-311a85431dea',
    ]),*/
    /*...addFamilyToHouseholds(context, [
      '0c0fc5a0-bd50-4f21-be6c-9b8fed692cd0',
      '7eac425d-5d08-4fa1-ac85-9166885761f1',
      'aa7741a6-6706-4b71-babd-018b71cdc67d',
      '446c08ea-1808-4723-9ad6-8caf3c675f6b',
      '04c19494-469a-49f3-81f5-de60d4eff081',
      'b43b46a6-f697-400f-95cb-ea2ffac303e0',
      '6277fcee-0091-4c0b-951a-274e6c17165e',
      'e5a2d84a-64c4-491b-a2be-40181836ba65',
      '751adca5-e6f4-49f6-90da-2cdb157e3391',
      '454d7f3b-964e-4634-a45e-8d3f50aa2345',
      'e63547b2-1f7e-46a3-97ed-cae74db63809',
      '6fa856cc-68b7-4e4b-b3d0-5b416a002899',
      'adb6a1be-75f3-4de4-b9c6-331432e50b5f',
      '1f4de933-4675-458b-95e3-148bd9737352',
      '0a916966-67fc-4150-850d-9b867d942f9b',
      '89cba883-7da8-44ab-87a2-6757c2d23367',
      '52e46fc3-327c-44a5-bd0d-514e8ea9de66',
      'af9e5c91-778d-44d0-aee1-d4fbe05cb320',
      'b541e101-8a33-49aa-ba02-0edb1932afcb',
      'c0a13d7d-a50b-456a-a054-1d32dd2681c4',
      '45bd9237-9335-463c-bc10-46525a0ff55b',
    ]),
    ...addFamilyToHouseholds(context, [
      '87c0b30e-7a16-4564-a7e1-fba10121d70a',
      'ee1a0905-9e08-4ae4-b02c-6ad460cb8c24',
      'd16e3926-8198-4cf6-abff-cf285816640d',
      '67f48b9a-bc37-42a5-89fe-44f70e645f9b',
      '2ecb35b8-f4eb-4079-934a-031bc853cb98',
      'be0fb4e0-85a2-4703-9d71-dfeeb1e409a9',
      '75b9761e-1710-441c-9b6f-c94d86ca4831',
      '031fce23-1eaf-47ef-9554-5a3c36e48f70',
      '0cd68ec9-8717-4be3-8824-ddca3bc8b5e8',
      '4c09398f-c0db-47ca-9c94-12810027936b',
      '30e42396-ad57-46d5-86ec-bbbb4f446531',
      'e8357963-d9dd-4614-9f7a-7eef1b676e9a',
      'aeb9ad84-a0c3-4495-b28b-6a88fe353d20',
      '3248faf7-c920-4e4e-9aa1-820a1456369e',
      '61fbf7ae-691f-4964-beb3-8e7dd22bcc5c',
      '1939fbb5-3d16-4f52-a795-cb10667c88f8',
      '9c512729-8450-4730-b787-846801c4cc45',
      '1030cc3f-1a2c-442d-9f78-bf5d36230536',
      'e56b14b7-fd8f-4f59-b357-a0c4127decf5',
      '28892973-5216-4a2f-805c-afebb7df833d',
      'ad9acde8-21cd-46ec-9a7d-5bfd93e0f03f',
    ]),
    ...addFamilyToHouseholds(context, [
      '97ff2f65-8734-41fa-9118-109d0be17d69',
      '9c4be21c-0aa0-4bd2-8e2d-176b82f7b58f',
      '4c08cc3a-0d1e-44d9-8850-630ca5cc70fd',
      'f99ac80d-4f51-4b48-bc4c-8f5a30698691',
      '61cd9d5a-3ac1-4cb3-b257-5fbaf99141df',
      '2626833d-b35d-4e86-a047-669aafdab416',
      '5356d067-ba83-41cb-9864-1a6598f95023',
      'f8c0c27b-0847-40e5-8290-284d199d8ed9',
      '05e600bc-ccab-469d-85ff-22ac46c0247f',
      '48649ffd-4c68-498b-9675-f51d68e6b22e',
      '98769a03-1c5a-43cf-a1cc-8e9bef32f307',
      '83fbd488-3cdb-41e2-abe3-d3a16796f209',
      '22d505a6-3abb-4a7e-a7f2-95c806327668',
      'db3ac17c-1cc8-4b3a-92f4-dd25fad0374d',
      '4a8a3126-d074-4aea-83f6-19ec877cd171',
      '3eed4842-4b95-427f-a400-fdd3c20046bd',
      'c1743e68-a12c-4a14-a73e-19aa09fefe44',
      'fa79489d-f0d1-4e03-b45c-c8acb7bf69c7',
      'b47aea35-91b9-4824-ac5a-8402c067a5b0',
      'ea143dbf-8323-45dd-b6dc-9c16f754b12f',
      '6bf24b9d-dbaa-4f6e-88f1-efd616c7db5d',
    ]),
    ...addFamilyToHouseholds(context, [
      '33b640c4-a81f-4997-bdd1-e1d53bbc5bf5',
      '4afbfdd9-b804-4e92-92ea-44cb52d4e923',
      '92c2f9ec-1d0d-4fed-808d-a66a97f79067',
      'efb5fb40-b4e0-4ac7-9004-63ceea1e8ca6',
      '34e6eca5-c861-4957-bb03-d6d3fe154b1a',
      'b90d3e14-f207-4164-bbf0-8cec9aa8ed6e',
      '5c7204d4-b40a-433c-91fe-3f36b2f04ed4',
      '4692ce69-0bdd-464d-8555-10b5b50e5500',
      'd2f480d1-ca30-461b-884c-34b5c17da571',
      '925722d4-6377-4026-83f9-6a68b17cf3be',
      'b7512170-1c9b-45ab-b9bd-3fea8a347f8a',
      'bb182000-7d5e-4dab-8356-c82288ea97c2',
      '925355b2-7240-4b62-aee5-c4b34c531581',
      '4be6e5c0-88c2-4719-aa80-17ef7984225e',
      '4d40fcee-a5f1-4595-a065-499e06a7ed2e',
      '9217dc17-1509-4a01-9b4c-c494cc9ce80a',
      'a4594c6a-f070-40a0-966e-fd447a8054b6',
      '1c700396-0f4f-48b1-90ed-8a5cf2da9043',
      '87fcc3aa-d4a5-4458-a049-2e56240bb728',
      '832323b7-a81e-4e4d-96ef-39a7c7793cb2',
      '81a601a8-29f3-4de7-bed0-bbfd9ff35e6a',
    ]),
    ...addFamilyToHouseholds(context, [
      'adeecdab-d525-471d-a80d-c21e111158c0',
      '1fb04c10-eadb-4f8d-839b-6c9a1f18ee0d',
      'f97c3827-3f83-4c62-83ee-55f2d2f04cef',
      'e3a3ee92-8288-469b-8271-d1d13d35e766',
      'b4db5a6f-6eb5-4ab0-88d8-4ca5e169bbd6',
      '2132d72b-803f-4080-8608-880a8ba0dfdb',
      '11538d44-ad8c-4932-bae1-a069fc097718',
      'b46ad74a-a10d-4e27-968d-8e0a00fbccd1',
      '44225c32-f7b8-4e46-8585-24a41d293fc9',
      '76da7e7f-153c-479c-9f3f-cd8a228cfe13',
      '1a3741b7-acd7-41e1-af5a-d7e384068efd',
      '65eeb95f-6c04-4737-9b38-bf9b4dc4c081',
      '5faa1e9d-2cbf-43e6-ab39-2294647beea2',
      '6787a009-c8c4-4e68-8459-000d9378d57a',
      '6554985e-e8df-4e39-bba7-67de9926ff1c',
      '3dc99f23-14cc-448a-8c76-22b75f7704b2',
      '0af542f1-4691-46ea-a286-205a02f94dee',
    ]),
    ...addFamilyToHouseholds(context, [
      'b1689e2a-4407-418a-8bff-eb17e3b0cc67',
      '0061167d-e2f6-4bc4-bf19-eea23b97e5cd',
      'c9878005-021a-4ccc-9824-3383dc6c9a02',
      '633ee28a-4f9d-4eb5-82d4-b389fa905898',
      'b168e5ed-4a11-47b6-8305-220321a2b0d5',
      'fd722709-4caf-4e7d-bfa2-0ec5f5b82672',
      '0e6d7719-c69e-49e0-9170-1ae772f5b069',
      'b5cf99b4-e484-4a65-aa50-fa3eea53ebb4',
      '05c0e1b8-8f75-4b45-a048-76a96db91574',
      'b95bc937-11b1-4aed-ba3f-add8bb18bd3f',
      'a0b45e8f-2682-4843-ab09-d6e0d0492ee9',
      '8e8f6f65-d623-46ec-96d1-0e1c6434b6c2',
      'e7d0e29f-13ea-4879-9524-27fb46a7f075',
      '0708fc22-5aab-4da9-9cda-b40e1e7c4a43',
      '7868d19f-565f-464f-aa76-3f43093c1730',
      '921e9fa7-1db1-4471-9a32-33ebd0523ed5',
      'e58bc394-6479-4d53-a2c7-ebc8f3c24a83',
      '070943a7-ddc0-4ffa-b38f-d99e4ec78502'
    ]),
    addReportsToHouseholds(context, [

    ]),*/
  ];
};
