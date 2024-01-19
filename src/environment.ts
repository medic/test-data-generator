const getChtUrl = () => {
  if (!process.env.COUCH_URL) {
    throw new Error('COUCH_URL environment variable must be set.');
  }
  const match = /(https?:\/\/[^/]+)/i.exec(process.env.COUCH_URL);
  if (!match) {
    throw new Error('Failed to parse COUCH_URL.');
  }
  return match[1];
};

const getUsername = () => {
  const match = /https?:\/\/(.*):.*@.*/.exec(getChtUrl());
  if (!match) {
    console.error('Failed to parse username from COUCH_URL.');
    return null;
  }
  return match[1];
};

export const environment = {
  getChtUrl,
  getUsername,
};
