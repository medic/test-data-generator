import { resolve, extname } from 'node:path';
import { existsSync } from 'node:fs';

const SUPPORTED_INPUT_FILE = '.js';

const getInputFilePath = () => {
  const args = process.argv.slice(2);
  if (!args?.length) {
    throw new Error(
      'No path to the design file provided. Expected: npm run generate *path_to_your_custom_design_file*'
    );
  }

  const path = resolve(args[0]);
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
};
