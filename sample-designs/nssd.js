import { faker } from '@faker-js/faker';

const YES_NO = [ 'yes', 'no' ];

const getPlace = (context, contactType, nameSuffix) => {
  return {
    type: 'contact',
    contact_type: contactType,
    name: `${faker.location.city()}'s ${nameSuffix}`,
    external_id: faker.string.alphanumeric(5),
    notes: faker.lorem.lines(2),
    place_id: faker.string.numeric(),
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
  const houseNumber = faker.string.numeric({ max: 500 });
  const houseName = `${faker.person.firstName()}'s house (${houseNumber})`;
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
    reported_date: faker.date
      .recent({ days: 20 })
      .getTime(),
  };
};

const getPerson = (context, { sex = faker.person.sex(), ageRange = { min: 20, max: 60 } } = {}) => {
  const dobRaw = faker.date.birthdate({ mode: 'age', ...ageRange});
  const dobFormatted = `${dobRaw.getFullYear()}-${dobRaw.getMonth()}-${dobRaw.getDay()}`;
  const firstName = faker.person.firstName();
  const lastName = faker.person.firstName();
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
    marital_status: faker.helpers.arrayElement(['unmarried', 'unmarried']),
    level_of_education: faker.helpers.arrayElement(['lliterate', 'phd', 'post_graduate', 'graduation_level']),
    is_disabled: faker.helpers.arrayElement(YES_NO),
    occupation: faker.helpers.arrayElement(['unemployed', 'heavy_load', 'painter', 'carpenter']),
    caste_code: faker.helpers.arrayElement(['janajati', 'brahmin', 'muslim', 'dalit']),
    relation: faker.helpers.arrayElement(['house_head', 'wife_husband', 'son_daughter', 'mother_father']),
    meta: {
      created_by: context.username,
      created_by_person_uuid: '',
      created_by_place_uuid: ''
    },
    reported_date: faker.date.recent({ days: 25 }).getTime(),
  };
};

export default (context) => {
  return [
    {
      amount: 1,
      getDoc: () => getCenter(context),
      children: [
        {
          amount: 1,
          getDoc: () => getProvince(context),
          children: [
            {
              amount: 1,
              getDoc: () => getDistrict(context),
              children: [
                {
                  amount: 1,
                  getDoc: () => getMunicipality(context),
                  children: [
                    {
                      amount: 1,
                      getDoc: () => getWard(context),
                      children: [
                        {
                          amount: 1,
                          getDoc: () => getCHNArea(context),
                          children: [
                            {
                              amount: 1,
                              getDoc: () => getFCHVArea(context),
                              children: [
                                {
                                  amount: 1,
                                  getDoc: () => getHousehold(context),
                                  children: [
                                    {
                                      amount: 2,
                                      getDoc: () => getPerson(context),
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
