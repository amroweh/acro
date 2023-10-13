require("dotenv").config();

const Database = require("@replit/database");
const axios = require("axios");
const { App } = require("@slack/bolt");
const signingSecret = process.env["SLACK_SIGNING_SECRET"];
const botToken = process.env["SLACK_BOT_TOKEN"];

// Initialise the Slack Bot App using the slack bolt api
const app = new App({
  signingSecret: signingSecret,
  token: botToken,
});

// Initialise the database provided by replit
const db = new Database();

// Run the bot - Includes all possible replies based on what the user inputs
async function run() {
  await app.start(process.env.PORT || 12000);

  app.message("hello", async ({ message, say }) => {
    await say(
      "Hello from ACRO! This is your helpful bot for all Sky acronyms. To get started, try /acro <acronym>. For example, /acro CORS"
    );
  });

  app.message("quote", async ({ message, say }) => {
    await say(`Hello, <@${message.user}>, ${quote}`);
  });

  console.log(`⚡️ ACRO app is running!`);
}

run();
