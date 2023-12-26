import { Docs } from './docs.js';
import * as path from 'node:path';
import { DocDesign } from './doc-design.js';
import { getContext } from './design-context.js';

(async function() {
  const args = process.argv.slice(2);
  const designScriptPath = path.resolve(args[0]);
  const getDesign: DocDesign = (await import(designScriptPath)).default;
  const context= getContext();
  Docs.createDocs(getDesign(context));
})();
