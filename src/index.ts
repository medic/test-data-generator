import { Docs } from './docs.js';
// TODO: Read design script from CLI
import { CustomDesign } from './custom-design.js';

(function() {
  Docs.createDocs(new CustomDesign().getDesign());
})();
