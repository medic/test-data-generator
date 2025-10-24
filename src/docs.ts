import { v4 as uuid } from 'uuid';
import { Doc, DocType, Parent } from './doc-design.js';
import docWriter from './doc-writer.js';
import ReportsSaver from './reports-saver.js';

export class Docs {
  private static reportsSaver?: ReportsSaver;

  static setReportsSaver(saver: ReportsSaver) {
    Docs.reportsSaver = saver;
  }

  private static async saveDocs(docs: Doc[], dbName: string) {
    let docsToUpload = docs;
    
    if (Docs.reportsSaver) {
      const savedReports = await Docs.reportsSaver.saveReports(docs);
      const savedIds = new Set(savedReports.map(r => r._id));
      docsToUpload = docs.filter(doc => !savedIds.has(doc._id));
    } 
    
    if (docsToUpload.length > 0) {
      return docWriter.write(docsToUpload, dbName);
    }
  }

  static async createDocs(designs, parentDoc?: Doc) {
    await Docs.createDocsForDesigns(designs, parentDoc);
    if (!parentDoc) {
      await docWriter.flush();
      if (Docs.reportsSaver) {
        await Docs.reportsSaver.flush();
      }
    }
  }

  private static async createDocsForDesigns(designs, parentDoc?: Doc) {
    for(const [index, design] of designs.entries()) {
      if (!design.designId) {
        design.designId = index;
      }
      await this.createDocsForDesign(design, parentDoc);
    }
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

    await Docs.saveDocs(batch.map(entity => entity.doc), design.db);
    const entityWithChildrenToCreate = batch
      .filter(entity => entity.doc.type !== DocType.dataRecord && entity.design.children);
    for(const entity of entityWithChildrenToCreate) {
      await Docs.createDocsForDesigns(entity.design.children, entity.doc);
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
