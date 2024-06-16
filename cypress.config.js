const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "7accug",

  component: {
    devServer: {
      framework: "vue-cli",
      bundler: "webpack",
    },
  },

  component: {
    devServer: {
      framework: "vue-cli",
      bundler: "webpack",
    },
  },

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
