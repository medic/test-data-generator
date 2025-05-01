import { expect, use } from 'chai';
import chaiExclude from 'chai-exclude';
import chaiAsPromised from 'chai-as-promised';
use(chaiExclude);
use(chaiAsPromised);

import * as sinon from 'sinon';
import { SinonStub } from 'sinon';
import { DocType } from '../src/doc-design.js';
import { environment } from '../src/environment.js';
import docWriter from '../src/doc-writer.js';

const BASE_URL = 'http://localhost:5988';
const BULK_DOCS_PATH = '_bulk_docs';
const AUTH_TOKEN = 'my auth token';
const makeReport = (_id: string) => ({ _id, form: 'pregnancy_danger_sign', type: DocType.dataRecord });
const makeReports = (count: number) => Array.from({ length: count }, (_, i) => makeReport(`report-${i}`));
const getPostSuccessMsg = (docsLength: number, dbName: string) => `Successfully wrote ${docsLength} docs to ${dbName}.`;

describe('Doc writer', () => {
  let consoleErrorStub: SinonStub;
  let consoleInfoStub: SinonStub;
  let getChtUrlStub: SinonStub;
  let getAuthStub: SinonStub;
  let originalFetch;
  let fetchStub: SinonStub;
  let response: { status: number; ok: boolean; json: SinonStub; text: SinonStub };

  beforeEach(() => {
    getChtUrlStub = sinon.stub(environment, 'getChtUrl').returns(BASE_URL);
    getAuthStub = sinon.stub(environment, 'getAuth').returns(AUTH_TOKEN);

    originalFetch = global.fetch;
    response = {
      status: 200,
      ok: true,
      json: sinon.stub(),
      text: sinon.stub(),
    };
    fetchStub = global.fetch = sinon.stub().resolves(response);

    consoleErrorStub = sinon.stub(console, 'error');
    consoleInfoStub = sinon.stub(console, 'info');
  });

  afterEach(async () => {
    await docWriter.flush();
    sinon.restore();
    global.fetch = originalFetch;
  });

  describe('write', () => {
    it('immediately POSTs 1000 docs', async () => {
      const docs = makeReports(1000);
      const dbName = 'reports';

      await docWriter.write(docs, dbName);

      expect(getChtUrlStub.calledOnceWithExactly()).to.be.true;
      expect(getAuthStub.calledOnceWithExactly()).to.be.true;

      expect(fetchStub.calledOnce).to.be.true;
      expect(fetchStub.args[0]).to.deep.equal([
        `${BASE_URL}/${dbName}/${BULK_DOCS_PATH}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: `Basic ${AUTH_TOKEN}` },
          body: JSON.stringify({ docs }),
        }
      ]);

      expect(consoleErrorStub.notCalled).to.be.true;
      expect(consoleInfoStub.calledOnceWithExactly(getPostSuccessMsg(docs.length, dbName))).to.be.true;
    });

    it('immediately POSTs batches of 1000 docs when given more than 1000 docs', async () => {
      const docs = makeReports(3333);
      const dbName = 'reports';

      await docWriter.write(docs, dbName);

      expect(getChtUrlStub.calledOnceWithExactly()).to.be.true;
      expect(getAuthStub.calledOnceWithExactly()).to.be.true;

      expect(fetchStub.callCount).to.deep.equal(3);
      expect(fetchStub.args[0]).to.deep.equal([
        `${BASE_URL}/${dbName}/${BULK_DOCS_PATH}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: `Basic ${AUTH_TOKEN}` },
          body: JSON.stringify({ docs: docs.slice(0, 1000) }),
        }
      ]);

      expect(fetchStub.args[1]).to.deep.equal([
        `${BASE_URL}/${dbName}/${BULK_DOCS_PATH}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: `Basic ${AUTH_TOKEN}` },
          body: JSON.stringify({ docs: docs.slice(1000, 2000) }),
        }
      ]);

      expect(fetchStub.args[2]).to.deep.equal([
        `${BASE_URL}/${dbName}/${BULK_DOCS_PATH}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: `Basic ${AUTH_TOKEN}` },
          body: JSON.stringify({ docs: docs.slice(2000, 3000) }),
        }
      ]);

      expect(consoleErrorStub.notCalled).to.be.true;
      expect(consoleInfoStub.args).to.deep.equal([
        [getPostSuccessMsg(1000, dbName)],
        [getPostSuccessMsg(1000, dbName)],
        [getPostSuccessMsg(1000, dbName)]
      ]);
    });

    it('defaults to medic database when none is provided', async () => {
      const docs = makeReports(1000);
      const dbName = 'medic';

      await docWriter.write(docs);

      expect(getChtUrlStub.calledOnceWithExactly()).to.be.true;
      expect(getAuthStub.calledOnceWithExactly()).to.be.true;

      expect(fetchStub.calledOnce).to.be.true;
      expect(fetchStub.args[0]).to.deep.equal([
        `${BASE_URL}/${dbName}/${BULK_DOCS_PATH}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: `Basic ${AUTH_TOKEN}` },
          body: JSON.stringify({ docs }),
        }
      ]);

      expect(consoleErrorStub.notCalled).to.be.true;
      expect(consoleInfoStub.calledOnceWithExactly(getPostSuccessMsg(docs.length, dbName))).to.be.true;
    });

    [0, 1, 999].forEach(count => {
      it('does not POST when less than 1000 docs are provided', async () => {
        const docs = makeReports(count);

        await docWriter.write(docs);

        expect(getChtUrlStub.notCalled).to.be.true;
        expect(fetchStub.notCalled).to.be.true;
        expect(consoleErrorStub.notCalled).to.be.true;
        expect(consoleInfoStub.notCalled).to.be.true;
      });
    });

    it('logs error message when POST fails', async () => {
      const docs = makeReports(1000);
      const dbName = 'medic';
      fetchStub.onFirstCall().resolves({ ok: false, text: sinon.stub().resolves('Error message') });

      await expect(docWriter.write(docs)).to.eventually.be.rejectedWith(
        'Error message'
      );

      expect(getChtUrlStub.calledOnceWithExactly()).to.be.true;
      expect(getAuthStub.calledOnceWithExactly()).to.be.true;

      expect(fetchStub.calledOnce).to.be.true;
      expect(fetchStub.args[0]).to.deep.equal([
        `${BASE_URL}/${dbName}/${BULK_DOCS_PATH}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: `Basic ${AUTH_TOKEN}` },
          body: JSON.stringify({ docs }),
        }
      ]);
      expect(consoleErrorStub.calledOnce).to.be.true;
      expect(consoleErrorStub.args[0][0]).to.equal(`Failed writing docs to ${dbName}. Errors: `);
      expect(consoleErrorStub.args[0][1]).to.deep.equal(`Error message`);
      expect(consoleInfoStub.notCalled).to.be.true;
    });
  });

  describe('flush', () => {
    it('POSTs remaining docs in all databases', async () => {
      const medicDocs = makeReports(999);
      const sentinelDocs = makeReports(333);
      const usersDocs = makeReports(1);

      await docWriter.write(medicDocs);
      await docWriter.write(sentinelDocs, 'sentinel');
      await docWriter.write(usersDocs, '_users');

      expect(fetchStub.notCalled).to.be.true;

      await docWriter.flush();

      expect(getChtUrlStub.callCount).to.equal(3);
      expect(getAuthStub.callCount).to.equal(3);

      expect(fetchStub.callCount).to.be.equal(3);

      expect(fetchStub.args[0]).to.deep.equal([
        `${BASE_URL}/medic/${BULK_DOCS_PATH}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: `Basic ${AUTH_TOKEN}` },
          body: JSON.stringify({ docs: medicDocs }),
        }
      ]);
      expect(fetchStub.args[1]).to.deep.equal([
        `${BASE_URL}/sentinel/${BULK_DOCS_PATH}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: `Basic ${AUTH_TOKEN}` },
          body: JSON.stringify({ docs: sentinelDocs }),
        }
      ]);

      expect(fetchStub.args[2]).to.deep.equal([
        `${BASE_URL}/_users/${BULK_DOCS_PATH}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: `Basic ${AUTH_TOKEN}` },
          body: JSON.stringify({ docs: usersDocs }),
        }
      ]);

      expect(consoleErrorStub.notCalled).to.be.true;
      expect(consoleInfoStub.args).to.deep.equal([
        [getPostSuccessMsg(medicDocs.length, 'medic')],
        [getPostSuccessMsg(sentinelDocs.length, 'sentinel')],
        [getPostSuccessMsg(usersDocs.length, '_users')]
      ]);
    });

    it('does nothing if no docs are queued for POSTing', async () => {
      await docWriter.flush();

      expect(getChtUrlStub.notCalled).to.be.true;
      expect(getAuthStub.notCalled).to.be.true;
      expect(fetchStub.notCalled).to.be.true;
      expect(consoleErrorStub.notCalled).to.be.true;
      expect(consoleInfoStub.notCalled).to.be.true;
    });
  });
});
