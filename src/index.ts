import { Docs } from './docs.js';
import * as path from 'node:path';
import { DocDesign } from './doc-design.js';
import { context } from './design-context.js';

(async function() {
  try {
    const args = process.argv.slice(2);
    const designScriptPath = path.resolve(args[0]);
    const getDesign: DocDesign = (await import(designScriptPath)).default;
    Docs.createDocs(getDesign(context.get()));
  } catch (error) {
    console.error('ERROR: ', error.message || error);
    process.exit(1);
  }
})();
