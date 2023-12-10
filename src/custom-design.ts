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
    return [
      {
        amount: 1,
        getDoc: () => ({
          _id: uuid(),
          type: DocType.dataRecord,
          firstName: faker.person.firstName(),
        }),
      },
    ];
  }

  private getContactsDesign(): DesignSpec[] {
    return [
      { // Level 1
        amount: 1,
        getDoc: () => ({
          _id: uuid(),
          type: '',
          firstName: faker.person.firstName(),
        }),
        children: [ // Level 2
          {
            amount: 1,
            getDoc: () => ({
              _id: uuid(),
              type: '',
              firstName: faker.person.firstName(),
            }),
            children: [ // Level 3
              {
                amount: 1,
                getDoc: () => ({
                  _id: uuid(),
                  type: '',
                  firstName: faker.person.firstName(),
                }),
                children: [ // Level 4

                ],
              },
            ],
          },
        ],
      },
    ];
  }
}
