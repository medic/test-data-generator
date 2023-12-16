import { Docs } from './docs.js';
import * as path from 'node:path';
import { DesignContext, DocDesign } from './doc-design.js';

const getUsername = () => {
  const parseUserNameFromURL = /https?:\/\/(.*):.*@.*/;
  const couchURL = process.env.COUCH_URL;
  const match = parseUserNameFromURL.exec(couchURL);
  return match[1];
};

(async function() {
  const args = process.argv.slice(2);
  const designScriptPath = path.resolve(args[0]);
  const getDesign: DocDesign = (await import(designScriptPath)).default;
  const context: DesignContext = {
    username: getUsername()
  };
  Docs.createDocs(getDesign(context));
})();
