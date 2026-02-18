import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.{ts,js}",
    supportFile: "cypress/support/e2e.ts",
    video: process.env.CI === "true",
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    retries: process.env.CI === "true" ? 1 : 0,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
  },

  env: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  },

  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
});
