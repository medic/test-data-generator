import { expect } from 'chai';
import * as Sinon from 'sinon';
import { restore, stub } from 'sinon';
import { context } from '../src/design-context.js';
import { environment } from '../src/environment.js';

describe('DesignContext', () => {
  let getUsernameStub: Sinon.SinonStub;

  beforeEach(() => getUsernameStub = stub(environment, 'getUsername'));
  afterEach(() => restore());

  it('should return a context with the username when getUsername returns a username', () => {
    getUsernameStub.returns('admin');
    const designContext = context.get();
    expect(designContext).to.deep.equal({ username: 'admin' });
  });

  it('should return a context with null username when getUsername returns null', () => {
    getUsernameStub.returns(null);
    const designContext = context.get();
    expect(designContext).to.deep.equal({ username: null });
  });
});
