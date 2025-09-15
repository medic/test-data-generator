import { expect } from 'chai';
import * as sinon from 'sinon';
import { cli } from '../src/cli.js';

describe('environment', () => {
  let consoleErrorStub: sinon.SinonStub;

  beforeEach(() => consoleErrorStub = sinon.stub(console, 'error'));
  afterEach(() => sinon.restore());

  describe('getChtUrl', () => {
    it('should throw an error when COUCH_URL is not set', async () => {
      sinon.stub(cli, 'getChtUrl').returns('');
      const { environment } = await import(`../src/environment.ts?${Date.now()}`);
      expect(environment.getChtUrl).to.throw('COUCH_URL environment variable must be set.');
    });

    [
      'invalid_url',
      'admin:password@localhost:5984',
      'localhost:5984',
      'http:///admin:password@localhost:5984'
    ].forEach(couchURL => {
      it('should throw an error when COUCH_URL does not match the expected format', async () => {
        sinon.stub(cli, 'getChtUrl').returns(couchURL);
        const { environment } = await import(`../src/environment.ts?${Date.now()}`);
        expect(environment.getChtUrl).to.throw(`Failed to parse COUCH_URL [${couchURL}].`);
      });
    });

    [
      ['http://admin:password@localhost:5984', 'http://localhost:5984/'],
      ['https://root:root@google.com/', 'https://google.com/'],
      ['http://admin:password@localhost:5984/medic', 'http://localhost:5984/'],
      ['https://root:root@google.com/somewhere/else', 'https://google.com/'],
    ].forEach(([couchURL, expected]) => {
      it('should return the base URL when COUCH_URL is valid', async () => {
        sinon.stub(cli, 'getChtUrl').returns(couchURL);
        const { environment } = await import(`../src/environment.ts?${Date.now()}`);
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
        sinon.stub(cli, 'getChtUrl').returns(couchURL);
        const { environment } = await import(`../src/environment.ts?${Date.now()}`);
        const context = environment.getUsername();
        expect(context).to.equal('admin');
      });
    });

    it('should include null username when not included in COUCH_URL', async () => {
      sinon.stub(cli, 'getChtUrl').returns('http://localhost:5984');
      const { environment } = await import(`../src/environment.ts?${Date.now()}`);

      const username = environment.getUsername();
      expect(username).to.equal('');
      expect(consoleErrorStub.calledOnce).to.be.true;
      expect(consoleErrorStub.args[0]).to.deep
        .equal([`Failed to parse username from COUCH_URL [http://localhost:5984/].`]);
    });
  });

  describe('getAuth', () => {
    [
      ['http://admin:password@localhost:5984', 'YWRtaW46cGFzc3dvcmQ='],
      ['https://root:root@google.com/', 'cm9vdDpyb290'],
    ].forEach(([couchURL, expected]) => {
      it('should return the correct auth when COUCH_URL is valid', async () => {
        sinon.stub(cli, 'getChtUrl').returns(couchURL);
        const { environment } = await import(`../src/environment.ts?${Date.now()}`);
        const result = environment.getAuth();
        expect(result).to.equal(expected);
      });
    });
  });
});
