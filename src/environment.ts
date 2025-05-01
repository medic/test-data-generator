let url: URL;
let auth: string;
let username: string;

const getChtUrl = () => {
  if (url) {
    return url.toString();
  }

  if (!process.env.COUCH_URL) {
    throw new Error('COUCH_URL environment variable must be set.');
  }

  const match = /(https?:\/\/[^/]+)/i.exec(process.env.COUCH_URL);
  if (!match) {
    throw new Error(`Failed to parse COUCH_URL [${process.env.COUCH_URL}].`);
  }

  try {
    url = new URL(process.env.COUCH_URL);
    auth = Buffer.from(`${url.username}:${url.password}`, 'utf8').toString('base64');
    username = url.username;
    url.username = '';
    url.password = '';
    url.pathname = '';
  } catch (err) {
    throw new Error(`Failed to parse COUCH_URL [${process.env.COUCH_URL}].`);
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
    console.error(`Failed to parse username from COUCH_URL [${process.env.COUCH_URL}].`);
  }
  return username;
};

export const environment = {
  getChtUrl,
  getAuth,
  getUsername,
};
