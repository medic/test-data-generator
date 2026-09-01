import { resolve, extname } from 'node:path';
import { existsSync } from 'node:fs';

const args = () => process.argv.slice(2);

const getFlag = (flag: string): string | undefined => {
  const flagIndex = args().indexOf(flag);
  return flagIndex !== -1 ? args()[flagIndex + 1] : undefined;
};
const getChtUrl = () => {
  const flagUrl = getFlag('--couch-url');
  if (flagUrl) {
    return flagUrl;
  }
  
  if (process.env.COUCH_URL) {
    return process.env.COUCH_URL;
  }
  
  if (args()[1] && !args()[1].startsWith('--')) {
    return args()[1];
  }
  
  return undefined;
};

const getSaveReportsDir = (): string | undefined => {
  return getFlag('--save-reports-json');
};

const getSaveReportsPercentage = (): number => {
  const percentage = getFlag('--save-reports-percentage');
  if (!percentage) {
    return 100;
  }
  const value = parseInt(percentage, 10);
  if (isNaN(value) || value < 0 || value > 100) {
    throw new Error('--save-reports-percentage must be between 0 and 100');
  }
  return value;
};

const SUPPORTED_INPUT_FILE = '.js';
const getInputFilePath = () => {
  const designFileArg = args().find((arg, idx) => {
    if (arg.startsWith('--')){
      return false;
    }
    if (idx > 0 && args()[idx - 1].startsWith('--')){
      return false;
    }
    return true;
  });
  
  if (!designFileArg) {
    throw new Error(
      'No path to the design file provided.'
    );
  }

  const path = resolve(designFileArg);
  if (extname(path) !== SUPPORTED_INPUT_FILE) {
    throw new Error(
      'The design file is not a JavaScript file. Retry using a file with extension ending in .js'
    );
  }

  if (!existsSync(path)) {
    throw new Error('The design file does not exist in the specified location. Verify the path is correct.');
  }

  return path;
};

export const cli = {
  getInputFilePath,
  getChtUrl,
  getSaveReportsDir,
  getSaveReportsPercentage,
};
