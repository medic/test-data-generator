import { cli } from './cli.js';

let url: URL;
let auth: string;
let username: string;

const getChtUrl = () => {
  if (url) {
    return url.toString();
  }

  const chtUrl = cli.getChtUrl();
  if (!chtUrl) {
    throw new Error('COUCH_URL environment variable must be set.');
  }

  const match = /(https?:\/\/[^/]+)/i.exec(chtUrl);
  if (!match) {
    throw new Error(`Failed to parse COUCH_URL [${chtUrl}].`);
  }

  try {
    url = new URL(chtUrl);
    auth = Buffer.from(`${url.username}:${url.password}`, 'utf8').toString('base64');
    username = url.username;
    url.username = '';
    url.password = '';
    url.pathname = '';
  } catch (err) {
    throw new Error(`Failed to parse COUCH_URL [${chtUrl}].`);
  }

  return url.toString();
};

const getAuth = () => {
  getChtUrl();
  return auth;
};

const getUsername = () => {
  getChtUrl();

  if (!username) {
    console.error(`Failed to parse username from COUCH_URL [${url.toString()}].`);
  }
  return username;
};

export const environment = {
  getChtUrl,
  getAuth,
  getUsername,
};
