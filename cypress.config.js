const { defineConfig } = require('cypress');

module.exports = defineConfig({
  viewportHeight: 1080,
  viewportWidth: 1920,
  video: false,
  screenshotOnRunFailure: false,
  retries: {
    openMode: 0,
    runMode: 2,
  },
  env: {
    username: 'mdbilalansari@gmail.com',
    password: 'Password@123',
    apiUrl: 'https://api.realworld.io',
  },
  e2e: {
    baseUrl: 'http://localhost:4200',
    excludeSpecPattern: ['**/1-getting-started', '**/2-advanced-examples'],
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    setupNodeEvents(on, config) {
      // implement node event listeners here
      const username = process.env.DB_USERNAME;
      const password = process.env.PASSWORD;

      // if (!username) throw new Error('missing USERNAME environment variable');
      // if (!password) throw new Error('missing PASSWORD environment variable');

      config.env = { username, password };
      return config;
    },
  },
});
