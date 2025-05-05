#!/usr/bin/env node

import { cli } from './cli.js';
import { Docs } from './docs.js';
import { DocDesign } from './doc-design.js';
import { context } from './design-context.js';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = String(0); // allow self-signed certificates

(async function() {
  try {
    const designScriptPath = cli.getInputFilePath();
    const getDesign: DocDesign = (await import(designScriptPath)).default;
    await Docs.createDocs(getDesign(context.get()));
  } catch (error) {
    console.error('ERROR: ', error.message || error);
    process.exit(1);
  }
})();
