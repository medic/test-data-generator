import { resolve } from 'node:path';
import { expect, assert } from 'chai';
import * as Sinon from 'sinon';
import { restore, stub } from 'sinon';
import { cli } from '../src/cli.js';

describe('cli', () => {
  let argvStub: Sinon.SinonStub;

  beforeEach(() => {
    argvStub = stub(process, 'argv');
  });

  afterEach(() => restore());

  describe('getInputFilePath', () => {
    it('should return the design file path successfully', () => {
      try {
        argvStub.get(() => [ 'node-path', 'application-entry', 'tests/files/empty-design-file.js' ]);

        const path = cli.getInputFilePath();

        expect(path).to.equal(resolve('tests/files/empty-design-file.js'));
      } catch (error) {
        assert.fail('Should have not thrown an error');
      }
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
});
