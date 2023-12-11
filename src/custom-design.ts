import { faker } from '@faker-js/faker'; // API Reference: https://fakerjs.dev/api
import { v4 as uuid } from 'uuid';

import { DesignSpec, DocDesign, DocType } from './doc-design.js';

/**
 * Design the test data by modifying this class. See the README for more info.
 */
export class CustomDesign extends DocDesign {
  getDesign(): DesignSpec[] {
    return [
      ...this.getContactsDesign(),
      ...this.getReportsDesign(),
    ];
  }

  private getReportsDesign(): DesignSpec[] {
    const existingContact = {
      _id: '425e9d00-bd2f-473d-8d3b-a4fdb021db47',
      parent: { _id: '947535d5-cf8a-4b1d-93ca-0b39826b3e68' },
    };

    return [
      { // Adding reports to existing contacts
        amount: 4,
        getDoc: () => this.getPregnancyDangerSignDoc(existingContact),
      },
    ];
  }

  private getContactsDesign(): DesignSpec[] {
    return [
      {
        amount: 3,
        getDoc: () => this.getPlaceDoc('district_hospital', 'Hospital'),
        children: [{
          amount: 2,
          getDoc: () => this.getPlaceDoc('health_center', 'Health Center'),
          children: [
            { amount: 2, getDoc: () => this.getPersonDoc('chw') },
            {
              amount: 30,
              getDoc: () => this.getPlaceDoc('clinic', 'Household'),
              children: [ { amount: 4, getDoc: () => this.getPersonDoc('patient') } ],
            }
          ],
        }],
      },
      { // Adding to existing facility
        amount: 2,
        getDoc: () => ({
          ...this.getPlaceDoc('health_center', 'Health Center'),
          parent: { _id: '947535d5-cf8a-4b1d-93ca-0b39826b3e68' },
        }),
        children: [ { amount: 3, getDoc: () => this.getPersonDoc('chw') } ],
      },
    ];
  }

  private getPlaceDoc(type: string, nameSuffix: string) {
    return {
      _id: uuid(),
      type,
      name: `${faker.location.city()}'s ${nameSuffix}`,
      external_id: faker.string.alphanumeric(5),
      notes: faker.lorem.lines(2),
      meta: {
        created_by: 'admin',
        created_by_person_uuid: '',
        created_by_place_uuid: '',
      },
      reported_date: faker.date.recent({ days: 20 }).getTime(),
    };
  }

  private getPersonDoc(role: string) {
    const dobRaw = faker.date.past({ years: 40 });
    const dobFormatted = `${dobRaw.getFullYear()}-${dobRaw.getMonth()}-${dobRaw.getDay()}`;
    return {
      _id: uuid(),
      type: DocType.person,
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
      user_for_contact: { create: true },
      meta: {
        created_by: 'admin',
        created_by_person_uuid: '',
        created_by_place_uuid: ''
      },
      reported_date: faker.date.recent({ days: 25 }).getTime(),
    };
  }

  private getPregnancyDangerSignDoc(existingContact) {
    const yesNoOptions = [ 'yes', 'no' ];

    return {
      _id: uuid(),
      form: 'pregnancy_danger_sign',
      type: DocType.dataRecord,
      content_type: 'xml',
      reported_date: faker.date.recent({ days: 5 }).getTime(),
      contact: existingContact,
      fields: {
        inputs: {
          source: 'contact',
          source_id: '',
          contact: {
            _id: existingContact._id,
            name: 'Erick Loral',
            sex: 'male',
            parent: existingContact.parent,
          }
        },
        patient_age_in_years: 34,
        patient_uuid: existingContact._id,
        patient_id: faker.string.alphanumeric(5),
        patient_name: 'Erick Loral',
        t_danger_signs_referral_follow_up_date: faker.date.recent({ days: 5 }).toISOString(),
        t_danger_signs_referral_follow_up: 'yes', // Intentionally 'yes'
        pregnancy_uuid_ctx: existingContact._id,
        danger_signs: {
          danger_signs_note: '',
          danger_signs_question_note: '',
          vaginal_bleeding: 'yes', // Intentionally 'yes'
          fits: faker.helpers.arrayElement(yesNoOptions),
          severe_abdominal_pain: faker.helpers.arrayElement(yesNoOptions),
          severe_headache: faker.helpers.arrayElement(yesNoOptions),
          very_pale: faker.helpers.arrayElement(yesNoOptions),
          fever: faker.helpers.arrayElement(yesNoOptions),
          reduced_or_no_fetal_movements: faker.helpers.arrayElement(yesNoOptions),
          breaking_water: faker.helpers.arrayElement(yesNoOptions),
          easily_tired: faker.helpers.arrayElement(yesNoOptions),
          face_hand_swelling: faker.helpers.arrayElement(yesNoOptions),
          breathlessness: faker.helpers.arrayElement(yesNoOptions),
          r_danger_sign_present: faker.helpers.arrayElement(yesNoOptions),
          refer_patient_note_1: '',
          refer_patient_note_2: '',
        },
        meta: { instanceID: `uuid:${uuid()}` }
      },
    };
  }
}
