import { environment } from './environment.js';
import axios from 'axios';
const BATCH_SIZE = 1000;
const docsByDb = {};
const write = async (docs, dbName = 'medic') => {
    if (!docsByDb[dbName]) {
        docsByDb[dbName] = [];
    }
    docsByDb[dbName].push(...docs);
    if (docsByDb[dbName].length >= BATCH_SIZE) {
        await postDocs(dbName);
    }
};
const flush = async () => {
    for (const dbName of Object.keys(docsByDb)) {
        await postDocs(dbName, 0);
    }
};
const postDocs = async (dbName, remainingLimit = BATCH_SIZE) => {
    const path = `${environment.getChtUrl()}/${dbName}/_bulk_docs`;
    do {
        const docs = docsByDb[dbName].splice(0, BATCH_SIZE);
        try {
            await axios.post(path, { docs });
            console.info(`Successfully wrote ${docs.length} docs to ${dbName}.`);
        }
        catch (error) {
            console.error(`Failed writing docs to ${dbName}. Errors: `, error.message || error.errors || error);
        }
    } while (docsByDb[dbName].length > remainingLimit);
};
export default {
    write,
    flush,
};
