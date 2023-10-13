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
  await db
    .set("CORS", {
      definition: "Cross Origin ...",
      department: "Identity",
      date_added: "13-10-2023",
    })
    .then(() => {});
  await app.start(process.env.PORT || 12000);

  app.message(/^(hello|hey|hi|yo)$/, async ({ message, say }) => {
    await say(
      "Hello from ACRO! This is your helpful bot for all Sky acronyms. To get started, try acro <acronym>. For example, acro CORS"
    );
  });

  app.message(/^(acro).*/, async ({ message, say }) => {
    const acronym = message.text.slice(5);
    const result = await db.get(acronym);
    if (result) await say("this acronym means: " + result.definition);
    else
      await say(
        `Unfortunately, we do not know what ${acronym} means yet. If you would like to add it or request its meaning, you can use 'add <acronym>' or 'request <acronym>'`
      );
  });

  app.message(/^add.*/, async ({ message, say }) => {
    const acronym = message.text.slice(4);
    // add check to prevent spaces in acronym
  });

  console.log(`⚡️ ACRO app is running!`);
}

run();
