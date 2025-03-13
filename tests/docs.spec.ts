import { expect, use } from 'chai';
import chaiExclude from 'chai-exclude';
import chaiAsPromised from 'chai-as-promised';
use(chaiExclude);
use(chaiAsPromised);
import { stub, restore, resetHistory } from 'sinon';

import { Docs } from '../src/docs.js';
import { DocType } from '../src/doc-design.js';
import { environment } from '../src/environment.js';

describe('Docs', () => {
  let consoleErrorStub;
  let originalFetch;
  let fetchStub;
  let response;

  beforeEach(() => {
    stub(environment, 'getChtUrl').returns('http://localhost:5988/');
    stub(environment, 'getAuth').returns('token');
    consoleErrorStub = stub(console, 'error');
    originalFetch = global.fetch;
    response = {
      status: 200,
      ok: true,
      json: stub(),
      text: stub(),
    };
    fetchStub = global.fetch = stub().resolves(response);
  });

  afterEach(() => {
    restore();
    global.fetch = originalFetch;
  });

  it('should create docs based on the doc design', async () => {
    const reportDoc = { _id: 'report-x', form: 'pregnancy_danger_sign', type: DocType.dataRecord };
    const personDoc = { _id: 'person-x', type: DocType.person, name: 'Green Hospital' };
    const hospitalDoc = { _id: 'hospital-x', type: 'hospital', name: 'Green Hospital' };
    const centerDoc = { _id: 'center-x', type: 'center', name: 'Green Health Center' };
    const clinicDoc = { _id: 'clinic-x', type: 'clinic', name: 'Green Clinic' };
    const unitDoc = { _id: 'unit-x', type: 'unit', name: 'Green Unit' };
    const houseDoc = { _id: 'house-x', type: 'house', name: 'Green House' };

    const designs = [
      { designId: 'design-1', amount: 2, db: 'medic-users-meta', getDoc: () => reportDoc },
      {
        designId: 'design-2',
        amount: 1,
        getDoc: () => hospitalDoc,
        children: [
          {
            designId: 'design-2-1',
            amount: 1,
            getDoc: () => unitDoc,
            children: [
              { designId: 'design-2-1-1', amount: 3, getDoc: () => clinicDoc },
              { designId: 'design-2-1-2', amount: 3, getDoc: () => personDoc },
              {
                designId: 'design-2-1-3',
                amount: 1,
                getDoc: () => houseDoc,
                children: [
                  { amount: 2, getDoc: () => personDoc },
                ],
              },
            ],
          },
          {
            amount: 1,
            getDoc: () => centerDoc,
            children: [
              { amount: 3, getDoc: () => personDoc },
              {
                amount: 1,
                getDoc: () => houseDoc,
                children: [
                  { amount: 10, getDoc: () => personDoc },
                ],
              },
            ],
          },
          { amount: 1, getDoc: () => personDoc },
        ],
      },
    ];

    await Docs.createDocs(designs);

    expect(fetchStub.callCount).to.equal(2);
    expect(fetchStub.args[0]).to.deep.equal([
      'http://localhost:5988/medic-users-meta/_bulk_docs',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: 'Basic token' },
        body: JSON.stringify({ docs: [reportDoc, reportDoc] }),
      },
    ]);

    expect(fetchStub.args[1]).to.deep.equal([
      'http://localhost:5988/medic/_bulk_docs',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: 'Basic token' },
        body: JSON.stringify({
          docs: [
            hospitalDoc,
            { ...unitDoc, parent: { _id: hospitalDoc._id } },
            ...Array(3).fill({ ...clinicDoc, parent: { _id: unitDoc._id, parent: { _id: hospitalDoc._id } } }),
            ...Array(3).fill({ ...personDoc, parent: { _id: unitDoc._id, parent: { _id: hospitalDoc._id } } }),
            { ...houseDoc, parent: { _id: unitDoc._id, parent: { _id: hospitalDoc._id } } },
            ...Array(2).fill({
              ...personDoc,
              parent: { _id: houseDoc._id, parent: { _id: unitDoc._id, parent: { _id: hospitalDoc._id } } }
            }),
            { ...centerDoc, parent: { _id: hospitalDoc._id } },
            ...Array(3).fill({ ...personDoc, parent: { _id: centerDoc._id, parent: { _id: hospitalDoc._id } } }),
            { ...houseDoc, parent: { _id: centerDoc._id, parent: { _id: hospitalDoc._id } } },
            ...Array(10).fill({
              ...personDoc,
              parent: { _id: houseDoc._id, parent: { _id: centerDoc._id, parent: { _id: hospitalDoc._id } } }
            }),
            { ...personDoc, parent: { _id: hospitalDoc._id } }
          ]
        }),
      },
    ]);
  });

  it('should create docs based on the doc design and not override parent object', async () => {
    const hospitalDoc = { _id: 'hospital-x', type: 'hospital', name: 'Green Hospital' };
    const centerDoc = { _id: 'center-x', type: 'center', name: 'Green Health Center' };
    const unitDoc = { _id: 'unit-x', type: 'unit', name: 'Green Unit' };

    const designs = [
      {
        designId: 'design-1',
        amount: 1,
        getDoc: () => hospitalDoc,
        children: [
          { designId: 'design-1-1', amount: 4, getDoc: () => unitDoc },
          {
            designId: 'design-1-2',
            amount: 13,
            getDoc: () => ({ ...centerDoc, parent: { _id: '009' } }),
          },
        ],
      },
      {
        designId: 'design-2',
        amount: 3,
        getDoc: () => ({ ...centerDoc, parent: { _id: '007' } }),
        children: [
          { designId: 'design-2-1', amount: 7, getDoc: () => unitDoc }
        ],
      },
    ];

    await Docs.createDocs(designs);

    expect(fetchStub.callCount).to.equal(1);

    expect(fetchStub.args[0]).to.deep.equal([
      'http://localhost:5988/medic/_bulk_docs',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: 'Basic token' },
        body: JSON.stringify({
          docs: [
            hospitalDoc,
            ...Array(4).fill({ ...unitDoc, parent: { _id: hospitalDoc._id } }),
            ...Array(13).fill({ ...centerDoc, parent: { _id: '009' } }),
            ...Array(3).fill({ ...centerDoc, parent: { _id: '007' } }),
            ...Array(21).fill({ ...unitDoc, parent: { _id: centerDoc._id, parent: { _id: '007' } } }),
          ]
        }),
      },
    ]);
  });

  it('should provide the parent doc value when getting a new doc from the design', async () => {
    const hospitalDoc = { _id: 'hospital-x', type: 'hospital', name: 'Green Hospital' };
    const getHospitalDoc = stub().returns(hospitalDoc);
    const getCenterDoc = stub().returns({ _id: 'center-x', type: 'center', name: 'Green Health Center' });
    const designs = [{
      amount: 1,
      getDoc: getHospitalDoc,
      children: [{
        amount: 1,
        getDoc: getCenterDoc,
      }]
    },];

    await Docs.createDocs(designs);

    expect(fetchStub.callCount).to.equal(1);
    expect(getHospitalDoc.calledOnce).to.be.true;
    expect(getHospitalDoc.args[0][0]).to.deep.equal({ parent: undefined });
    expect(getCenterDoc.calledOnce).to.be.true;
    expect(getCenterDoc.args[0][0]).to.deep.equal({ parent: hospitalDoc });
  });

  it('should generate _id value if none is provided', async () => {
    const hospitalDoc = { type: 'hospital', name: 'Green Hospital' };
    const designs = [{ designId: 'design-1', amount: 1, getDoc: () => hospitalDoc },];

    await Docs.createDocs(designs);

    expect(fetchStub.callCount).to.equal(1);
    const actualDoc = JSON.parse(fetchStub.args[0][1].body).docs[0];
    expect(actualDoc).excluding(['_id']).to.deep.equal(hospitalDoc);
  });

  it('should auto-populate parent linkage fields when writing new contacts', async () => {
    const greatGrandParent = { _id: 'greatGrandParentUUID', type: 'district_hospital' };
    const grandParent = { _id: 'grandParentUUID', type: 'health_center' };
    const parent = { _id: 'parentUUID', type: 'clinic' };
    const doc = { _id: 'doc-x', type: DocType.person };
    const designs = [{
      amount: 1,
      getDoc: () => greatGrandParent,
      children: [
        {
          amount: 1,
          getDoc: () => grandParent,
          children: [
            {
              amount: 1,
              getDoc: () => parent,
              children: [{ amount: 1, getDoc: () => doc } ],
            },
          ],
        },
      ],
    }];

    await Docs.createDocs(designs);

    expect(fetchStub.callCount).to.equal(1);
    const docs = JSON.parse(fetchStub.args[0][1].body).docs;
    expect(docs).to.deep.equal([
      greatGrandParent,
      { ...grandParent, parent: { _id: greatGrandParent._id } },
      { ...parent, parent: { _id: grandParent._id, parent: { _id: greatGrandParent._id } } },
      { ...doc, parent: { _id: parent._id, parent: { _id: grandParent._id, parent: { _id: greatGrandParent._id } } }}
    ]);
  });

  it('should use provided data to populate contact parent linkage fields', async () => {
    const parent = { _id: 'parentUUID', type: 'clinic' };
    const doc = { _id: 'doc-x', type: DocType.person, parent: { _id: 'otherParent' } };
    const designs = [{
      designId: 'design-1',
      amount: 1,
      getDoc: () => parent,
      children: [{ amount: 1, getDoc: () => doc } ],
    }];

    await Docs.createDocs(designs);

    expect(fetchStub.callCount).to.equal(1);
    const docs = JSON.parse(fetchStub.args[0][1].body).docs;
    expect(docs).to.deep.equal([parent, doc]);
  });

  [
    [{ type: DocType.person }, { patient_id: 'patientID', patient_uuid: 'parentUUID' }],
    [{ type: 'contact', contact_type: DocType.person }, { patient_id: 'patientID', patient_uuid: 'parentUUID' }],
    [{ type: 'district_hospital' }, { place_id: 'placeID', place_uuid: 'parentUUID' }],
    [{ type: 'contact', contact_type: 'custom_place' }, { place_id: 'placeID', place_uuid: 'parentUUID' }],
  ].forEach(([parentTypeData, expectedFields]) => {
    it('should auto-populate data_record parent linkage fields', async () => {
      const parent = {
        _id: 'parentUUID',
        patient_id: 'patientID',
        place_id: 'placeID',
        ...parentTypeData
      };
      const doc = { _id: 'doc-x', type: DocType.dataRecord, fields: { hello: 'world' } };
      const designs = [{
        amount: 1,
        getDoc: () => parent,
        children: [{ amount: 1, getDoc: () => doc } ],
      }];

      await Docs.createDocs(designs);
      expect(fetchStub.callCount).to.equal(1);
      const docs = JSON.parse(fetchStub.args[0][1].body).docs;
      expect(docs).to.deep.equal([
        parent,
        {
          ...doc,
          contact: { _id: parent._id },
          fields: {
            ...doc.fields,
            ...expectedFields
          }
        }
      ]);
    });
  });

  it('should error if amount or getDoc are missing', async () => {
    let designs = [
      { designId: 'design-1' },
      { designId: 'design-2', amount: 2, getDoc: () => ({ _id: '124', type: 'hospital' }) },
    ];

    await expect(Docs.createDocs(designs)).to.eventually.be.rejectedWith(
      'Remember to set the "amount" and the "getDoc" in design-1.'
    );

    resetHistory();
    designs = [
      {
        designId: 'design-1',
        amount: 2,
        getDoc: () => ({ _id: '124', type: 'clinic' }),
        // @ts-expect-error children property is not on type
        children: [ { designId: 'design-1-1', amount: 3 }, { designId: 'design-1-2', getDoc: () => {} } ],
      },
    ];

    await expect(Docs.createDocs(designs)).to.eventually.be.rejectedWith(
      'Remember to set the "amount" and the "getDoc" in design-1-1.'
    );

    resetHistory();
    designs = [{
      designId: 'design-1',
      amount: 0,
      getDoc: () => ({ _id: '124', type: 'clinic' }),
    }];

    await expect(Docs.createDocs(designs)).to.eventually.be.rejectedWith(
      'Remember to set the "amount" and the "getDoc" in design-1.'
    );
  });

  it('should throw errors when saving docs', async () => {
    const designs = [
      { designId: 'design-1', amount: 2, getDoc: () => ({ _id: '124', type: 'hospital' }) },
    ];
    response.ok = false;
    response.text.resolves('Ups something happened');

    await expect(Docs.createDocs(designs)).to.eventually.be.rejectedWith('Ups something happened');

    expect(consoleErrorStub.calledOnce).to.be.true;
    expect(consoleErrorStub.args[0]).to.have.members([
      'Failed saving docs from 1. Errors: ',
      'Ups something happened'
    ]);
  });
});
