import axios from 'axios';
import { assert, expect } from 'chai';
import { stub, restore, resetHistory } from 'sinon';

import { Docs } from '../src/docs.js';
import { DocType } from '../src/doc-design.js';
import { environment } from '../src/environment.js';

describe('Docs', () => {
  let axiosPostStub;
  let consoleErrorStub;
  let consoleWarnStub;

  beforeEach(() => {
    stub(environment, 'getChtUrl').returns('http://localhost:5988');
    axiosPostStub = stub(axios, 'post').resolves();
    consoleErrorStub = stub(console, 'error');
    consoleWarnStub = stub(console, 'warn');
  });

  afterEach(() => restore());

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

    await Promise
      .all(Docs.createDocs(designs))
      .catch(() => assert.fail('Should have not thrown error.'));

    expect(axiosPostStub.callCount).to.equal(12);
    expect(axiosPostStub.args[0][0]).to.contain('/medic-users-meta/_bulk_docs');
    axiosPostStub.args.slice(1).forEach(call => expect(call[0]).to.contain('/medic/_bulk_docs'));
    expect(axiosPostStub.args[0][1]).to.deep.equal({
      docs: Array(2).fill({ ...reportDoc }),
    });
    expect(axiosPostStub.args[1][1]).to.deep.equal({
      docs: [{ ...hospitalDoc }],
    });

    expect(axiosPostStub.args[2][1]).to.deep.equal({
      docs: [{ ...unitDoc, parent: { _id: hospitalDoc._id } }],
    });
    expect(axiosPostStub.args[3][1]).to.deep.equal({
      docs: [{ ...centerDoc, parent: { _id: hospitalDoc._id } }],
    });
    expect(axiosPostStub.args[4][1]).to.deep.equal({
      docs: [{ ...personDoc, parent: { _id: hospitalDoc._id } }],
    });

    expect(axiosPostStub.args[5][1]).to.deep.equal({
      docs: Array(3).fill({
        ...clinicDoc,
        parent: { _id: unitDoc._id, parent: { _id: hospitalDoc._id } },
      }),
    });
    expect(axiosPostStub.args[6][1]).to.deep.equal({
      docs: Array(3).fill({
        ...personDoc,
        parent: { _id: unitDoc._id, parent: { _id: hospitalDoc._id } },
      }),
    });
    expect(axiosPostStub.args[7][1]).to.deep.equal({
      docs: [{
        ...houseDoc,
        parent: { _id: unitDoc._id, parent: { _id: hospitalDoc._id } },
      }],
    });

    expect(axiosPostStub.args[8][1]).to.deep.equal({
      docs: Array(3).fill({
        ...personDoc,
        parent: { _id: centerDoc._id, parent: { _id: hospitalDoc._id } },
      }),
    });
    expect(axiosPostStub.args[9][1]).to.deep.equal({
      docs: [{
        ...houseDoc,
        parent: { _id: centerDoc._id, parent: { _id: hospitalDoc._id } },
      }],
    });

    expect(axiosPostStub.args[10][1]).to.deep.equal({
      docs: Array(2).fill({
        ...personDoc,
        parent: { _id: houseDoc._id, parent: { _id: unitDoc._id, parent: { _id: hospitalDoc._id } } },
      }),
    });

    expect(axiosPostStub.args[11][1]).to.deep.equal({
      docs: Array(10).fill({
        ...personDoc,
        parent: { _id: houseDoc._id, parent: { _id: centerDoc._id, parent: { _id: hospitalDoc._id } } },
      }),
    });
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

    await Promise
      .all(Docs.createDocs(designs))
      .catch(() => assert.fail('Should have not thrown error.'));

    expect(axiosPostStub.callCount).to.equal(7);
    axiosPostStub.args.forEach(call => expect(call[0]).to.contain('/_bulk_docs'));
    expect(axiosPostStub.args[0][1]).to.deep.equal({
      docs: [{ ...hospitalDoc }],
    });
    expect(axiosPostStub.args[1][1]).to.deep.equal({
      docs: Array(3).fill({ ...centerDoc, parent: { _id: '007' } }),
    });

    expect(axiosPostStub.args[2][1]).to.deep.equal({
      docs: Array(4).fill({ ...unitDoc, parent: { _id: hospitalDoc._id } }),
    });
    expect(axiosPostStub.args[3][1]).to.deep.equal({
      docs: Array(13).fill({ ...centerDoc, parent: { _id: '009' } }),
    });

    expect(axiosPostStub.args[4][1]).to.deep.equal({
      docs: Array(7).fill({ ...unitDoc, parent: { _id: centerDoc._id, parent: { _id: '007' } } }),
    });
    expect(axiosPostStub.args[5][1]).to.deep.equal({
      docs: Array(7).fill({ ...unitDoc, parent: { _id: centerDoc._id, parent: { _id: '007' } } }),
    });
    expect(axiosPostStub.args[6][1]).to.deep.equal({
      docs: Array(7).fill({ ...unitDoc, parent: { _id: centerDoc._id, parent: { _id: '007' } } }),
    });
  });

  it('should generate _id value if none is provided', async () => {
    const hospitalDoc = { type: 'hospital', name: 'Green Hospital' };
    const designs = [{ designId: 'design-1', amount: 1, getDoc: () => hospitalDoc },];

    await Promise
      .all(Docs.createDocs(designs))
      .catch(() => assert.fail('Should have not thrown error.'));

    expect(axiosPostStub.callCount).to.equal(1);
    const actualDoc = axiosPostStub.args[0][1].docs[0];
    expect(actualDoc).to.deep.include(hospitalDoc);
    expect(actualDoc._id).to.be.a('string');
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

    await Promise
      .all(Docs.createDocs(designs))
      .catch(() => assert.fail('Should have not thrown error.'));

    expect(axiosPostStub.callCount).to.equal(4);
    expect(axiosPostStub.args[0][1]).to.deep.equal({ docs: [greatGrandParent] });
    expect(axiosPostStub.args[1][1]).to.deep.equal({ docs: [{
      ...grandParent,
      parent: { _id: greatGrandParent._id }
    }] });
    expect(axiosPostStub.args[2][1]).to.deep.equal({ docs: [{
      ...parent,
      parent: { _id: grandParent._id, parent: { _id: greatGrandParent._id } }
    }] });
    expect(axiosPostStub.args[3][1]).to.deep.equal({ docs: [{
      ...doc,
      parent: { _id: parent._id, parent: { _id: grandParent._id, parent: { _id: greatGrandParent._id } } }
    }] });
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

    await Promise
      .all(Docs.createDocs(designs))
      .catch(() => assert.fail('Should have not thrown error.'));

    expect(axiosPostStub.callCount).to.equal(2);
    expect(axiosPostStub.args[0][1]).to.deep.equal({ docs: [parent] });
    expect(axiosPostStub.args[1][1]).to.deep.equal({ docs: [doc] });
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

      await Promise
        .all(Docs.createDocs(designs))
        .catch(() => assert.fail('Should have not thrown error.'));

      expect(axiosPostStub.callCount).to.equal(2);
      expect(axiosPostStub.args[0][1]).to.deep.equal({ docs: [parent] });
      expect(axiosPostStub.args[1][1]).to.deep.equal({ docs: [{
        ...doc,
        contact: { _id: parent._id },
        fields: {
          ...doc.fields,
          ...expectedFields
        }
      }] });
    });
  });

  it('should warn if amount or getDoc are missing', async () => {
    let designs = [
      { designId: 'design-1' },
      { designId: 'design-2', amount: 2, getDoc: () => ({ _id: '124', type: 'hospital' }) },
    ];

    await Promise
      .all(Docs.createDocs(designs))
      .catch(() => assert.fail('Should have not thrown error.'));

    expect(axiosPostStub.calledOnce).to.be.true;
    expect(consoleWarnStub.calledOnce).to.be.true;
    expect(consoleWarnStub.args[0][0]).to.equal('Remember to set the "amount" and the "getDoc" in design-1.');

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

    await Promise.all(Docs.createDocs(designs));

    expect(axiosPostStub.calledOnce).to.be.true;
    expect(consoleWarnStub.callCount).to.equal(4); // The first "amount" is 2 then it will run the "children" twice.
    expect(consoleWarnStub.args[0][0]).to.equal('Remember to set the "amount" and the "getDoc" in design-1-1.');

    resetHistory();
    designs = [{
      designId: 'design-1',
      amount: 0,
      getDoc: () => ({ _id: '124', type: 'clinic' }),
    }];

    await Promise.all(Docs.createDocs(designs));

    expect(axiosPostStub.notCalled).to.be.true;
    expect(consoleWarnStub.calledOnce).to.be.true;
    expect(consoleWarnStub.args[0][0]).to.equal('Remember to set the "amount" and the "getDoc" in design-1.');
  });

  it('should catch errors when saving docs', async () => {
    const designs = [
      { designId: 'design-1', amount: 2, getDoc: () => ({ _id: '124', type: 'hospital' }) },
    ];
    const error = new Error('Ups something happened');
    axiosPostStub.rejects(error);

    await Promise.all(Docs.createDocs(designs));

    expect(axiosPostStub.calledOnce).to.be.true;
    expect(consoleErrorStub.calledOnce).to.be.true;
    expect(consoleErrorStub.args[0]).to.have.members([ 'Failed saving docs from design-1. Errors: ', error.message ]);
  });

  it('should catch errors when saving docs, but continue saving other batches', async () => {
    const designs = [
      {
        designId: 'design-1',
        amount: 2,
        getDoc: () => ({ _id: '124', type: 'ward-b' })
      },
      {
        designId: 'design-2',
        amount: 2,
        getDoc: () => ({ _id: '888', type: 'ward-a' })
      },
    ];
    const error = new Error('Ups something happened');
    axiosPostStub.onFirstCall().rejects(error);

    await Promise.all(Docs.createDocs(designs));

    expect(axiosPostStub.calledTwice).to.be.true;
    expect(axiosPostStub.args[0][0]).to.contain('/_bulk_docs');
    expect(axiosPostStub.args[0][1]).to.deep.equal({
      docs: Array(2).fill({ _id: '124', type: 'ward-b' }),
    });
    expect(axiosPostStub.args[1][0]).to.contain('/_bulk_docs');
    expect(axiosPostStub.args[1][1]).to.deep.equal({
      docs: Array(2).fill({ _id: '888', type: 'ward-a' }),
    });
    expect(consoleErrorStub.calledOnce).to.be.true;
    expect(consoleErrorStub.args[0]).to.have.members([ 'Failed saving docs from design-1. Errors: ', error.message ]);
  });
});
