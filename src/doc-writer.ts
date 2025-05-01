import { Doc } from './doc-design.js';
import { environment } from './environment.js';

const BATCH_SIZE = 1000;
const docsByDb: { [dbName: string]: Doc[] } = {};

const postDocs = async (dbName: string, remainingLimit = BATCH_SIZE): Promise<void> => {
  const path = `${environment.getChtUrl()}/${dbName}/_bulk_docs`;
  const auth = environment.getAuth();
  do {
    const docs = docsByDb[dbName].splice(0, BATCH_SIZE);

    const response = await fetch(path, {
      method: 'POST',
      headers: {
        authorization: `Basic ${auth}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ docs }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`Failed writing docs to ${dbName}. Errors: `, body);
      throw new Error(body);
    }

    console.info(`Successfully wrote ${docs.length} docs to ${dbName}.`);

  } while (docsByDb[dbName].length > remainingLimit);
};

const write = async (docs: Doc[], dbName = 'medic'): Promise<void> => {
  if (!docsByDb[dbName]) {
    docsByDb[dbName] = [];
  }
  docsByDb[dbName].push(...docs);
  if (docsByDb[dbName].length >= BATCH_SIZE) {
    await postDocs(dbName);
  }
};

const flush = async (): Promise<void> => {
  for (const dbName of Object.keys(docsByDb)) {
    await postDocs(dbName, 0);
    delete docsByDb[dbName];
  }
};

export default {
  write,
  flush,
};
