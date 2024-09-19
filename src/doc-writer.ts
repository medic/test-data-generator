import { Doc } from './doc-design.js';
import { environment } from './environment.js';
import axios from 'axios';

const BATCH_SIZE = 1000;

export class DocWriter {
  private docsByDb: { [dbName: string]: Doc[] } = {};

  async write(docs: Doc[], dbName = 'medic'): Promise<void> {
    if (!this.docsByDb[dbName]) {
      this.docsByDb[dbName] = [];
    }
    this.docsByDb[dbName].push(...docs);
    if (this.docsByDb[dbName].length >= BATCH_SIZE) {
      await this.postDocs(dbName);
    }
  }

  async flush(): Promise<void> {
    for (const dbName of Object.keys(this.docsByDb)) {
      await this.postDocs(dbName, 0);
    }
  }

  private async postDocs(dbName: string, remainingLimit = BATCH_SIZE): Promise<void> {
    const path = `${environment.getChtUrl()}/${dbName}/_bulk_docs`;
    do {
      const docs = this.docsByDb[dbName].splice(0, BATCH_SIZE);
      try {
        await axios.post(path, { docs });
        console.info(`Successfully wrote ${docs.length} docs to ${dbName}.`);
      } catch (error) {
        console.error(`Failed writing docs to ${dbName}. Errors: `, error.message || error.errors || error);
      }
    } while (this.docsByDb[dbName].length > remainingLimit);
  }
}
