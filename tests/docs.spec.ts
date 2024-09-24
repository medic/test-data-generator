import { assert, expect } from 'chai';
import { resetHistory, restore, stub } from 'sinon';

import { Docs } from '../src/docs.js';
import { DocType } from '../src/doc-design.js';
import docWriter from '../src/doc-writer.js';

describe('Docs', () => {
  let writeStub;
  let flushStub;

  beforeEach(() => {
    writeStub = stub(docWriter, 'write').resolves();
    flushStub = stub(docWriter, 'flush').resolves();
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

    await Docs.createDocs(designs)
      .catch(() => assert.fail('Should have not thrown error.'));

    expect(writeStub.callCount).to.equal(12);
    expect(writeStub.args[0][1]).to.equal('medic-users-meta');
    writeStub.args.slice(1).forEach(([, dbName]) => expect(dbName).to.be.undefined);
    expect(writeStub.args[0][0]).to.deep.equal(Array(2).fill({ ...reportDoc }));
    expect(writeStub.args[1][0]).to.deep.equal([{ ...hospitalDoc }]);
    expect(writeStub.args[2][0]).to.deep.equal([{ ...unitDoc, parent: { _id: hospitalDoc._id } }]);
    expect(writeStub.args[3][0]).to.deep.equal(Array(3).fill({
      ...clinicDoc,
      parent: { _id: unitDoc._id, parent: { _id: hospitalDoc._id } },
    }));
    expect(writeStub.args[4][0]).to.deep.equal(Array(3).fill({
      ...personDoc,
      parent: { _id: unitDoc._id, parent: { _id: hospitalDoc._id } },
    }));
    expect(writeStub.args[5][0]).to.deep.equal([{
      ...houseDoc,
      parent: { _id: unitDoc._id, parent: { _id: hospitalDoc._id } },
    }]);
    expect(writeStub.args[6][0]).to.deep.equal(Array(2).fill({
      ...personDoc,
      parent: { _id: houseDoc._id, parent: { _id: unitDoc._id, parent: { _id: hospitalDoc._id } } },
    }));
    expect(writeStub.args[7][0]).to.deep.equal([{ ...centerDoc, parent: { _id: hospitalDoc._id } }]);
    expect(writeStub.args[8][0]).to.deep.equal(Array(3).fill({
      ...personDoc,
      parent: { _id: centerDoc._id, parent: { _id: hospitalDoc._id } },
    }));
    expect(writeStub.args[9][0]).to.deep.equal([{
      ...houseDoc,
      parent: { _id: centerDoc._id, parent: { _id: hospitalDoc._id } },
    }]);
    expect(writeStub.args[10][0]).to.deep.equal(Array(10).fill({
      ...personDoc,
      parent: { _id: houseDoc._id, parent: { _id: centerDoc._id, parent: { _id: hospitalDoc._id } } },
    }));
    expect(writeStub.args[11][0]).to.deep.equal([{ ...personDoc, parent: { _id: hospitalDoc._id } }]);
    expect(flushStub.calledOnceWithExactly()).to.be.true;
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

    await Docs.createDocs(designs)
      .catch(() => assert.fail('Should have not thrown error.'));

    expect(writeStub.callCount).to.equal(7);
    writeStub.args.forEach(([,dbName]) => expect(dbName).to.be.undefined);
    expect(writeStub.args[0][0]).to.deep.equal([{ ...hospitalDoc }]);
    expect(writeStub.args[1][0]).to.deep.equal(Array(4).fill({ ...unitDoc, parent: { _id: hospitalDoc._id } }));
    expect(writeStub.args[2][0]).to.deep.equal(Array(13).fill({ ...centerDoc, parent: { _id: '009' } }));
    expect(writeStub.args[3][0]).to.deep.equal(Array(3).fill({ ...centerDoc, parent: { _id: '007' } }));
    expect(writeStub.args[4][0]).to.deep.equal(
      Array(7).fill({ ...unitDoc, parent: { _id: centerDoc._id, parent: { _id: '007' } } }),
    );
    expect(writeStub.args[5][0]).to.deep.equal(
      Array(7).fill({ ...unitDoc, parent: { _id: centerDoc._id, parent: { _id: '007' } } }),
    );
    expect(writeStub.args[6][0]).to.deep.equal(
      Array(7).fill({ ...unitDoc, parent: { _id: centerDoc._id, parent: { _id: '007' } } }),
    );
    expect(flushStub.calledOnceWithExactly()).to.be.true;
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

    await Docs.createDocs(designs)
      .catch(() => assert('Should have not thrown error.'));

    expect(writeStub.callCount).to.equal(2);
    expect(getHospitalDoc.calledOnce).to.be.true;
    expect(getHospitalDoc.args[0][0]).to.deep.equal({ parent: undefined });
    expect(getCenterDoc.calledOnce).to.be.true;
    expect(getCenterDoc.args[0][0]).to.deep.equal({ parent: hospitalDoc });
    expect(flushStub.calledOnceWithExactly()).to.be.true;
  });

  it('should generate _id value if none is provided', async () => {
    const hospitalDoc = { type: 'hospital', name: 'Green Hospital' };
    const designs = [{ designId: 'design-1', amount: 1, getDoc: () => hospitalDoc },];

    await Docs.createDocs(designs)
      .catch(() => assert.fail('Should have not thrown error.'));

    expect(writeStub.callCount).to.equal(1);
    const actualDoc = writeStub.args[0][0][0];
    expect(actualDoc).to.deep.include(hospitalDoc);
    expect(actualDoc._id).to.be.a('string');
    expect(flushStub.calledOnceWithExactly()).to.be.true;
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

    await Docs.createDocs(designs)
      .catch(() => assert.fail('Should have not thrown error.'));

    expect(writeStub.callCount).to.equal(4);
    expect(writeStub.args[0][0]).to.deep.equal([greatGrandParent]);
    expect(writeStub.args[1][0]).to.deep.equal([{
      ...grandParent,
      parent: { _id: greatGrandParent._id }
    }]);
    expect(writeStub.args[2][0]).to.deep.equal([{
      ...parent,
      parent: { _id: grandParent._id, parent: { _id: greatGrandParent._id } }
    }]);
    expect(writeStub.args[3][0]).to.deep.equal([{
      ...doc,
      parent: { _id: parent._id, parent: { _id: grandParent._id, parent: { _id: greatGrandParent._id } } }
    }]);
    expect(flushStub.calledOnceWithExactly()).to.be.true;
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

    await Docs.createDocs(designs)
      .catch(() => assert.fail('Should have not thrown error.'));

    expect(writeStub.callCount).to.equal(2);
    expect(writeStub.args[0][0]).to.deep.equal([parent]);
    expect(writeStub.args[1][0]).to.deep.equal([doc]);
    expect(flushStub.calledOnceWithExactly()).to.be.true;
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

      await Docs.createDocs(designs)
        .catch(() => assert.fail('Should have not thrown error.'));

      expect(writeStub.callCount).to.equal(2);
      expect(writeStub.args[0][0]).to.deep.equal([parent]);
      expect(writeStub.args[1][0]).to.deep.equal([{
        ...doc,
        contact: { _id: parent._id },
        fields: {
          ...doc.fields,
          ...expectedFields
        }
      }]);
      expect(flushStub.calledOnceWithExactly()).to.be.true;
    });
  });

  it('should error if amount or getDoc are missing', async () => {
    let designs = [
      { designId: 'design-1' },
      { designId: 'design-2', amount: 2, getDoc: () => ({ _id: '124', type: 'hospital' }) },
    ];

    await Docs.createDocs(designs)
      .then(() => assert.fail('Should have thrown error.'))
      .catch(error => expect(error.message).to.equal('Remember to set the "amount" and the "getDoc" in design-1.'));

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

    await Docs.createDocs(designs)
      .then(() => assert.fail('Should have thrown error.'))
      .catch(error => expect(error.message).to.equal('Remember to set the "amount" and the "getDoc" in design-1-1.'));

    resetHistory();
    designs = [{
      designId: 'design-1',
      amount: 0,
      getDoc: () => ({ _id: '124', type: 'clinic' }),
    }];

    await Docs.createDocs(designs)
      .then(() => assert.fail('Should have thrown error.'))
      .catch(error => expect(error.message).to.equal('Remember to set the "amount" and the "getDoc" in design-1.'));

    expect(flushStub.notCalled).to.be.true;
  });
});
