/** @type {import('lint-staged').Config} */
export default {
  // Client ts/tsx/js/jsx
  'client/**/*.{ts,tsx,js,jsx}': (files) => {
    const clientFiles = files
      .filter((f) => f.startsWith('client/'))
      .map((f) => f.replace(/^client\//, ''));

    if (clientFiles.length === 0) return [];

    const eslintCmd = `cd client && npx eslint --fix ${clientFiles.join(' ')}`;
    const prettierCmd = `cd client && npx prettier --write ${clientFiles.join(' ')}`;

    return [eslintCmd, prettierCmd];
  },

  // Server ts/js
  'server/**/*.{ts,tsx,js}': (files) => {
    const serverFiles = files
      .filter((f) => f.startsWith('server/'))
      .map((f) => f.replace(/^server\//, ''));

    if (serverFiles.length === 0) return [];

    const eslintCmd = `cd server && npx eslint --fix ${serverFiles.join(' ')}`;
    const prettierCmd = `cd server && npx prettier --write ${serverFiles.join(' ')}`;

    return [eslintCmd, prettierCmd];
  }
};