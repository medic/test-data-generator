import { expect } from 'chai';
import * as Sinon from 'sinon';
import { restore, stub } from 'sinon';
import { environment } from '../src/environment.js';

describe('environment', () => {
  let couchURL: string;
  let consoleErrorStub: Sinon.SinonStub;

  before(() => couchURL = process.env.COUCH_URL);
  after(() => process.env.COUCH_URL = couchURL);

  beforeEach(() => consoleErrorStub = stub(console, 'error'));
  afterEach(() => restore());

  describe('getChtUrl', () => {
    it('should throw an error when COUCH_URL is not set', () => {
      process.env.COUCH_URL = '';
      expect(environment.getChtUrl).to.throw('COUCH_URL environment variable must be set.');
    });

    [
      'invalid_url',
      'admin:password@localhost:5984',
      'localhost:5984',
      'http:///admin:password@localhost:5984'
    ].forEach(couchURL => {
      it('should throw an error when COUCH_URL does not match the expected format', () => {
        process.env.COUCH_URL = couchURL;
        expect(environment.getChtUrl).to.throw('Failed to parse COUCH_URL.');
      });
    });

    [
      ['http://admin:password@localhost:5984', 'http://admin:password@localhost:5984'],
      ['https://root:root@google.com/', 'https://root:root@google.com'],
      ['http://admin:password@localhost:5984/medic', 'http://admin:password@localhost:5984'],
      ['https://root:root@google.com/somewhere/else', 'https://root:root@google.com'],
    ].forEach(([couchURL, expected]) => {
      it('should return the base URL when COUCH_URL is valid', () => {
        process.env.COUCH_URL = couchURL;
        const result = environment.getChtUrl();
        expect(result).to.equal(expected);
      });
    });
  });

  describe('getUsername', () => {
    [
      'http://admin:password@localhost:5984',
      'https://admin:password@localhost:5984',
    ].forEach(couchURL => {
      it(`should include username from COUCH_URL (${couchURL})`, async () => {
        process.env.COUCH_URL = couchURL;
        const context = environment.getUsername();
        expect(context).to.equal('admin');
      });
    });

    it('should include null username when not included in COUCH_URL', async () => {
      process.env.COUCH_URL = 'http://localhost:5984';
      const context = environment.getUsername();
      expect(context).to.be.null;
      expect(consoleErrorStub.calledOnce).to.be.true;
      expect(consoleErrorStub.args[0]).to.deep.equal(['Failed to parse username from COUCH_URL.']);
    });
  });
});
