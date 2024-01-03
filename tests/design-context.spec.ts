import { expect } from 'chai';
import * as Sinon from 'sinon';
import { restore, stub } from 'sinon';
import { getContext } from '../src/design-context.js';

describe('DesignContext', () => {
  let couchURL: string;
  let consoleErrorStub: Sinon.SinonStub;

  before(() => couchURL = process.env.COUCH_URL);
  after(() => process.env.COUCH_URL = couchURL);

  beforeEach(() => consoleErrorStub = stub(console, 'error'));
  afterEach(() => restore());

  [
    'http://admin:password@localhost:5984',
    'https://admin:password@localhost:5984',
  ].forEach(couchURL => {
    it(`should include username from COUCH_URL (${couchURL})`, async () => {
      process.env.COUCH_URL = couchURL;

      const context = getContext();

      expect(context).to.deep.equal({ username: 'admin' });
    });
  });

  [
    'http://localhost:5984',
    null
  ].forEach(couchURL => {
    it('should include null username when not included in COUCH_URL', async () => {
      process.env.COUCH_URL = couchURL;

      const context = getContext();

      expect(context).to.deep.equal({ username: null });
      expect(consoleErrorStub.calledOnce).to.be.true;
      expect(consoleErrorStub.args[0]).to.deep.equal(['Failed to parse username from COUCH_URL.']);
    });
  });
});
