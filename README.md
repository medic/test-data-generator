# Test Data Generator for CHT Test Instances

Tool to upload test data into CHT test instances. 

## Description

> ⚠ WARNING! It is not recommended to use this tool to push data into production instances. ⚠ 

This tool is intended for application builders or CHT developer contributors that have knowledge about the design of docs from the CHT's CouchDB. 

Design the test data that fit your project hierarchy and reports. The tool will generate CouchDB docs and push them into your CHT test instance.

## Technologies and Packages Used

- TypeScript
- Axios
- UUID
- Faker

## Minimum System Requirements 

- npm >= 8.0.0
- node >= 16.0.0

## Setup and Getting Started

Instructions on setting up the project and getting it running on a local machine.

- Set the `COUCH_URL` environment variable to point your test instance, for example it something similar to this: `http://[user]:[pass]@[host]:[port]/medic`
- Double-check your CHT test instance is running
- Install the project by running `npm ci`
- Design the test data in a custom JavaScript file. See section [Designing Test Data](#designing-test-data).
- Build, generate data and upload by running `npm run generate *path_to_your_custom_design_file*`

## Designing Test Data

Steps to design the test data:

1. Create a custom JavaScript file that exports a `default` function. This function should match the [`DocDesign` type](./src/doc-design.ts).
2. Your custom function should return an array of [`DesignSpec`](./src/doc-design.ts) objects that define the structure of your data to create.
3. Generate and upload data `npm run generate *path_to_your_custom_design_file*`. That's all! You can check the data in the CHT's CouchDB.

Note that `getDoc` function should return an object with at least a `type: string`. Remember that `type` is a `data_record` for reports, but when it comes to contacts, use the `contact_types` defined in your CHT project's `app-settings.json`. 

### Example
```js
import { faker } from '@faker-js/faker'; // API Reference: https://fakerjs.dev/api

export default (context) => {
  return [
    {
      amount: 14, // This creates 14 reports
      getDoc: () => ({
        type: 'data_record',
        form: 'pregnancy_facility_visit_reminder',
        fields: {
          patient_name: faker.person.firstName(),
        },
      }),
    },
    {
      amount: 10, // This creates 10 hospitals
      getDoc: () => ({
        type: 'district_hospital',
        name: `${ faker.location.city() }'s hospital`,
      }),
      children: [
        {
          amount: 5, // This creates 5 people per each hospital
          getDoc: () => ({
            type: 'person',
            name: faker.person.firstName(),
          }),
        }
      ]
    },
  ];
}
```

Based on that previous example. The tool will create and push 14 report docs at once (the `amount` is also the batch size pushed into the CHT instance), then it creates 10 hospitals docs, and lastly it will create 5 people docs per each hospital (it's sent in groups of 5 docs to the CHT instance).

See the [sample-designs](./sample-designs) folder for more examples.

## Knows and TODOs

- Make the tool a CLI and read the path from a custom-design.ts script.
- Make test data samples for CHT's "default" config so we can use copy from there as a base. 
- Make a `getContact(doc._id)` function, to get an existing contact's information (name, etc.) and use it in new test data (right we need to hard code existing contact information).

## License

This project is licensed under the GNU GPLv3 License - see the LICENSE.md file for details
