import { v4 as uuid } from 'uuid';
import { DocType, Parent, Doc } from './doc-design.js';
import { environment } from './environment.js';

export class Docs {
  static readonly MAX_QUEUE = 300;
  static readonly queue = {};
  
  private static async saveDocs(docs, dbName = 'medic', batchId, flush = false) {
    if (!Docs.queue[dbName]) {
      Docs.queue[dbName] = [...docs];
    } else {
      Docs.queue[dbName].push(...docs);
    }

    if ((Docs.queue[dbName].length < Docs.MAX_QUEUE && !flush) || !Docs.queue[dbName].length) {
      return;
    }

    const path = `${environment.getChtUrl()}${dbName}/_bulk_docs`;
    const response = await fetch(path, {
      method: 'POST',
      headers: {
        authorization: `Basic ${environment.getAuth()}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ docs:  Docs.queue[dbName] }),
    });
    if (!response.ok) {
      const body = await response.text();
      console.error(`Failed saving docs from ${batchId}. Errors: `, body);
      throw new Error(body);
    }

    console.info(`Successfully saved ${Docs.queue[dbName].length} docs from ${batchId}.`);
    Docs.queue[dbName] = [];
  }

  static async flush() {
    for (const dbName of Object.keys(Docs.queue)) {
      await Docs.saveDocs([], dbName, 1, true);
    }
  }

  static async createDocs(designs, parentDoc?: Doc) {
    for(const [index, design] of designs.entries()) {
      if (!design.designId) {
        design.designId = index;
      }
      await this.createDocsForDesign(design, parentDoc);
    }
    !parentDoc && await Docs.flush();
  }

  private static async createDocsForDesign(design, parentDoc?: Doc) {
    if (!design.amount || !design.getDoc) {
      throw Error(`Remember to set the "amount" and the "getDoc" in ${design.designId}.`);
    }

    const batch = new Array(design.amount)
      .fill(null)
      .map(() => {
        const doc = design.getDoc({ parent: parentDoc });
        return {
          design,
          doc: {
            _id: uuid(),
            ...doc,
            ...Docs.getParentAssociationData(doc, parentDoc)
          },
        };
      });

    await Docs.saveDocs(batch.map(entity => entity.doc), design.db, design.designId);
    const entityWithChildrenToCreate = batch
      .filter(entity => entity.doc.type !== DocType.dataRecord && entity.design.children);
    for(const entity of entityWithChildrenToCreate) {
      await Docs.createDocs(entity.design.children, entity.doc);
    }
  }

  private static createParentRelation(parentDoc: Doc | Parent): Parent {
    if (!parentDoc) {
      return;
    }

    const result: Parent = { _id: parentDoc._id };
    let minified: Parent = result;

    while (parentDoc.parent) {
      minified.parent = { _id: parentDoc.parent._id };
      minified = minified.parent;
      parentDoc = parentDoc.parent;
    }

    return result;
  }

  private static getPatientPlaceIdentifiers(parentDoc: Doc) {
    if (parentDoc.type === DocType.person || parentDoc.contact_type === DocType.person) {
      return {
        patient_id: parentDoc.patient_id,
        patient_uuid: parentDoc._id,
      };
    }
    return {
      place_id: parentDoc.place_id,
      place_uuid: parentDoc._id,
    };
  }

  private static populateDataRecordParentData(doc, parentDoc: Doc) {
    return {
      contact: this.createParentRelation(parentDoc),
      fields: {
        ...this.getPatientPlaceIdentifiers(parentDoc),
        ...doc.fields,
      }
    };
  }

  private static getParentAssociationData(doc, parentDoc: Doc) {
    if (doc.type === DocType.dataRecord) {
      const dataRecordParent = doc.contact || parentDoc;
      return dataRecordParent ? this.populateDataRecordParentData(doc, dataRecordParent) : {};
    }
    const contactParent = doc.parent || parentDoc;
    if (!contactParent) {
      return {};
    }
    return { parent: this.createParentRelation(contactParent) };
  }
}
