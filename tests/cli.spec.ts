import { resolve } from 'node:path';
import { expect, assert } from 'chai';
import * as sinon from 'sinon';
import { cli } from '../src/cli.js';

describe('cli', () => {
  let argvStub: sinon.SinonStub;
  let envStub: sinon.SinonStub;

  beforeEach(() => {
    argvStub = sinon.stub(process, 'argv');
    envStub = sinon.stub(process, 'env');
  });

  afterEach(() => sinon.restore());

  describe('getInputFilePath', () => {
    it('should return the design file path successfully', () => {
      argvStub.get(() => [ 'node-path', 'application-entry', 'tests/files/empty-design-file.js' ]);
      const path = cli.getInputFilePath();
      expect(path).to.equal(resolve('tests/files/empty-design-file.js'));
    });

    it('should throw an error when design file does not exist in path', () => {
      try {
        argvStub.get(() => [ 'node-path', 'application-entry', 'tests/files/no-existing.js' ]);

        cli.getInputFilePath();

        assert.fail('Should have thrown an error');
      } catch (error) {
        expect(error?.message).to.equal(
          'The design file does not exist in the specified location. Verify the path is correct.'
        );
      }
    });

    [
      'folder/file-no-extension',
      'folder/file-wrong-extension.svg',
      'file-wrong-extension.ts',
    ].forEach(filePath => {
      it('should throw an error when the design file path has the wrong extension', () => {
        try {
          argvStub.get(() => [ 'node-path', 'application-entry', filePath ]);

          cli.getInputFilePath();

          assert.fail('Should have thrown an error');
        } catch (error) {
          expect(error?.message).to.equal(
            'The design file is not a JavaScript file. Retry using a file with extension ending in .js'
          );
        }
      });
    });

    it('should throw an error when design file path is not provided', () => {
      try {
        argvStub.get(() => [ 'node-path', 'application-entry' ]);

        cli.getInputFilePath();

        assert.fail('Should have thrown an error');
      } catch (error) {
        expect(error?.message).to.equal(
          'No path to the design file provided.'
        );
      }
    });
  });

  describe('getChtUrl', () => {
    it('should return the URL param when provided', () => {
      argvStub.get(() => [ 'node-path', 'application-entry', 'tests/files/empty-design-file.js', 'http://localhost:5984' ]);
      const url = cli.getChtUrl();
      expect(url).to.equal('http://localhost:5984');
    });

    it('should return env COUCH_URL no URL param is provided', () => {
      argvStub.get(() => [ 'node-path', 'application-entry', 'tests/files/empty-design-file.js' ]);
      envStub.get(() => ({ COUCH_URL: 'https://localhost' }));
      const url = cli.getChtUrl();
      expect(url).to.equal('https://localhost');
    });
  });
});
