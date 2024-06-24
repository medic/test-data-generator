#!/usr/bin/env node

import { cli } from './cli.js';
import { Docs } from './docs.js';
import { DocDesign } from './doc-design.js';
import { context } from './design-context.js';

(async function() {
  try {
    const designScriptPath = cli.getInputFilePath();
    const getDesign: DocDesign = (await import(designScriptPath)).default;
    Docs.createDocs(getDesign(context.get()));
  } catch (error) {
    console.error('ERROR: ', error.message || error);
    process.exit(1);
  }
})();
