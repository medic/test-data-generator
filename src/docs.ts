import axios from 'axios';

import { DocType } from './doc-design.js';

export class Docs {
  private static async saveDocs(docs) {
    const path = `${process.env.COUCH_URL}/_bulk_docs`;
    try {
      await axios.post(path, { docs });
      console.info('Successfully saved these docs ::>', docs);
    } catch (error) {
      console.error('Failed saving these docs ::>', docs, 'Error ::> ', error);
    }
  }

  static createDocs(designs, parentID?: string) {
    return designs.map(design => {
      if (!design.amount && !design.getDoc) {
        console.warn('Remember to set the "amount" and the "getDoc".');
        return;
      }

      const batch = new Array(design.amount)
        .fill(null)
        .map(() => ({
          design,
          doc: {
            ...design.getDoc(),
            parent: parentID && { _id: parentID },
          },
        }));

      const parentDocsPromise = Docs.saveDocs(batch.map(entity => entity.doc));
      return parentDocsPromise.then(() => Promise.all(
        batch
          .filter(entity => entity.doc.type !== DocType.dataRecord && entity.design.children)
          .map(entity => Docs.createDocs(entity.design.children, entity.doc._id))
      ));
    });
  }
}
