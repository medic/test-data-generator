# Test Data Generator for CHT Test Instances

Tool to upload test data into CHT test instances. 

## Description

This tool is intended for application builders or CHT developer contributors that have knowledge about the design of docs from the CHT's CouchDB. 

Design the test data that fit your project hierarchy and reports. The tool will generate CouchDB docs and push them into your CHT test instance.

> ⚠ It is recommended to not use this tool to push data into production instances. ⚠

## Technologies and Packages Used

- TypeScript
- Axios
- Uuid
- Faker 8.3.1

## Minimum System Requirements 

- npm >= 8.0.0
- node >= 16.0.0

## Setup and Getting Started

Instructions on setting up the project and getting it running on a local machine.

- Set the `COUCH_URL` environment variable to point your test instance, for example it something similar to this: `http://[user]:[pass]@[host]:[port]/medic`
- Double-check your CHT test instance is running
- Install the project by running `npm ci`
- Design the test data in `custom-design.ts`. See section [Designing Test Data](#designing-test-data).
- Build, generate data and upload by running `npm run generate`

## Designing Test Data

Steps to design the test data:

1. Open `src/custom-design.ts` - not the ideal way but to be improved in the future.
2. Create and export a class that extends the `DocDesign` abstract class. 
```ts
export class CustomDesign extends DocDesign {
  getDesign(): DesignSpec[] {
    return [];
  }
}
```
3. Update the `getDesign` function to return an array that adhere with the [DesignSpec interface](./src/doc-design.ts).
| Property | Required | Explanation |
| --------------- | --------------- | --------------- |
| amount: number | Yes | The number of docs to generate, it also servers as the batch size of docs to upload |
| getDoc(): Doc | Yes | A function that returns a CHT's COUCHDB doc. This function is call the number of times defined in `amount` property. The `Faker` and `UUID` libraries are available to use in this project for randomise data, just import them in `custom-design.ts` file. |
| children?: DesignSpec[] | No | Array of DesignSpecs. This is used to create contact docs that are dependent on a hierarchy. This tool will automatically add the `parent` object with the correct parent's `_id` as represented in the `getDesign` function |

Note that `getDoc` function should return an object with at least and `_id: string` and a `type: string`. Remember that `type` is a `data_record` for reports, but when it comes to contacts, use the `contact_types` defined in your CHT project's `app-settings.json`. 

4. By now you will have something resembling to this: 
```ts
import { faker } from '@faker-js/faker'; // API Reference: https://fakerjs.dev/api
import { v4 as uuid } from 'uuid';

import { DesignSpec, DocDesign, DocType } from './doc-design';

export class CustomDesign extends DocDesign {
  getDesign(): DesignSpec[] {
    return [
      {
        amount: 14, // This creates 14 reports
        getDoc: () => ({
          _id: uuid(),
          type: DocType.dataRecord,
          form: 'pregnancy_facility_visit_reminder',
          fields: {
            patient_name: faker.person.firstName(),
          },
        }),
      },
      {
        amount: 10, // This creates 10 hospitals
        getDoc: () => ({
          _id: uuid(),
          type: 'district_hospital',
          name: `${ faker.location.city() }'s hospital`,
        }),
        children: [
          {
            amount: 5, // This creates 5 people per each hospital
            getDoc: () => ({
              _id: uuid(),
              type: DocType.person,
              name: faker.person.firstName(),
            }),
          }
        ]
      },
    ];
  }
}
```

Based on that previous example. The tool will create and push 14 report docs at once (the `amount` is also the batch size pushed into the CHT instance), then it creates 10 hospitals docs, and lastly it will create 5 people docs per each hospital (it's sent in groups of 5 docs to the CHT instance).

6. Generate and upload data `npm run generate`. That's all! You can check the data in the CHT's CouchDB. 

## Knows and TODOs

- Add unit tests. 
- The custom-design.ts can be located in a better place.
- Make the tool a CLI and read the path from a custom-design.ts script.

## License

This project is licensed under the GNU GPLv3 License - see the LICENSE.md file for details
