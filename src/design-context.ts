import { DesignContext } from './doc-design.js';

const getUsername = () => {
  const parseUserNameFromURL = /https?:\/\/(.*):.*@.*/;
  const couchURL = process.env.COUCH_URL;
  const match = parseUserNameFromURL.exec(couchURL);
  if (!match) {
    console.error('Failed to parse username from COUCH_URL.');
    return null;
  }
  return match[1];
};

export const getContext = (): DesignContext => ({ username: getUsername() });
