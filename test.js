require("dotenv").config();

const Database = require("@replit/database");
const sqlite3 = require("sqlite3").verbose();
const axios = require("axios");
const { App } = require("@slack/bolt");
const signingSecret = process.env["SLACK_SIGNING_SECRET"];
const botToken = process.env["SLACK_BOT_TOKEN"];

// Initialise the Slack Bot App using the slack bolt api
const app = new App({
  signingSecret: signingSecret,
  token: botToken,
});

// Database setup
// Initialise SQLite3 DB
const db = new sqlite3.Database("./db.db", sqlite3.OPEN_READWRITE, (err) => {
  if (err) return console.log(err);
});

// Initial Setup - ONLY RUN FIRST TIME TO CREATE TABLES!!
function setupDB() {
  let sql;
  // Drop Table
  sql = `DROP TABLE acronyms`;
  // Create Table
  sql = `CREATE TABLE acronyms(id Integer PRIMARY KEY, acronym, definition, department)`;
  db.run(sql);
  // Add Entries
  let sqlInsert = `INSERT INTO acronyms(acronym, definition, department) VALUES (?,?,?)`;
  db.run(sqlInsert, ["CORS", "Cross Origin ... ", "IDENTITY"], (err) => {
    if (err) console.log(err);
  });
  db.run(sqlInsert, ["CORS", "Cross Origin 2 ... ", "DC Labs"], (err) => {
    if (err) console.log(err);
  });
}

// Database functions
async function getByAcronym(acronym) {
  let sqlSelect = `SELECT * FROM acronyms WHERE acronym LIKE('${acronym}')`;
  return new Promise((resolve, reject) => {
    db.all(sqlSelect, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function getByAcronymAndDepartment(acronym, department) {
  const resultList = await getByAcronym(acronym);
  return resultList.filter(
    (result) => result.department.toLowerCase() === department.toLowerCase()
  );
}

// Textualise results
function resultText(result) {
  let definitions = "";
  result.forEach(
    (el) => (definitions += "- " + el.definition + " (" + el.department + ")\n")
  );
  return definitions;
}

function unknownAcro(acronym) {
  return `Unfortunately, we do not know what ${acronym} means yet. If you would like to add it or request its meaning, you can use 'add <acronym>' or 'request <acronym>'`;
}

function showCommands() {
  return `The following commands are currently supported:\nastro <acronym>\nastro <acronym>\nastro <acronym> <department>\ndefine <acronym>\ndefine <acronym> <department>\nhelp\n`;
}

// Run the bot - Includes all possible replies based on what the user inputs
async function run() {
  await app.start(process.env.PORT || 12000);

  app.message(/^(hello|hey|hi|yo)$/, async ({ message, say }) => {
    await say(
      "Hello from ACRO! This is your helpful bot for all Sky acronyms. To get started, try acro <acronym>. For example, acro CORS"
    );
  });

  app.message(/^(acro|define).*/, async ({ message, say }) => {
    const words = message.text.split(" ");
    // case: acro

    const acronym = words[1];
    const department = words[2];

    // subcase 1: acro <some_acronym> <some_department>
    if (acronym && department) {
      const result = await getByAcronymAndDepartment(acronym, department);
      if (result && result.length > 0)
        await say("This acronym may mean: \n" + resultText(result));
      else await say(unknownAcro(acronym));
      return;
    }

    // subcase 2: acro <some_acronym>
    if (acronym) {
      const result = await getByAcronym(acronym);
      if (result && result.length > 0)
        await say("This acronym may mean: \n" + resultText(result));
      else await say(unknownAcro(acronym));
      return;
    }

    // subcase 3: acro
    return await say(showCommands());
  });

  // DESIGN THIS NOT TO EXCLUDE THE ABOVE REGEX
  app.message(/^/, async ({ message, say }) => {
    await say(showCommands());
  });

  console.log(`⚡️ ACRO app is running!`);
}

run();
