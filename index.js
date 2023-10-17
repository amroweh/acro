require("dotenv").config();

const sqlite3 = require("sqlite3").verbose();
const { App } = require("@slack/bolt");
const signingSecret = process.env["SLACK_SIGNING_SECRET"];
const botToken = process.env["SLACK_BOT_TOKEN"];
const {
  resultText,
  unknownAcro,
  showCommands,
  greet,
  acronymExists,
  acronymDoesntExist,
  acronymAdded,
  acronymUpdated,
  operationCancelled,
  incorrectAdd,
  incorrectUpdate,
  promptAddToDepartment,
  promptUpdateInDepartment,
} = require("./utils.js");

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

async function addAcronym(acronym, department, definition) {
  let sqlInsert = `INSERT INTO acronyms (acronym, department, definition) SELECT '${acronym.toLowerCase()}', '${department}', '${definition}' WHERE NOT EXISTS (SELECT acronym, department FROM acronyms WHERE acronym='${acronym.toLowerCase()}' AND department='${department}')`;
  return new Promise((resolve, reject) => {
    db.run(sqlInsert, [], (err) => {
      if (err) reject(err);
      else resolve("data successfully added into database");
    });
  });
}

async function updateAcronym(acronym, newDefinition, department = "none") {
  const getResult = await getByAcronymAndDepartment(acronym, department);
  console.log(getResult);

  let sqlUpdate = `UPDATE acronyms set definition='${newDefinition}' WHERE acronym='${acronym}' AND department='${department}'`;
  console.log(sqlUpdate);
  return new Promise((resolve, reject) => {
    db.run(sqlUpdate, [], (err) => {
      if (err) reject(err);
      else resolve("data successfully updated");
    });
  });
}

// Run the bot - Includes all possible replies based on what the user inputs
async function run() {
  await app.start(process.env.PORT || 11000);

  app.message(/^(hello|hey|hi|yo)$/, async ({ message, say }) => {
    await say(greet());
  });

  app.message(/^(help)$/, async ({ message, say }) => {
    await say(showCommands());
  });

  app.message(/^(acro|define).*/, async ({ message, say }) => {
    const words = message.text.split(" ");

    const acronym = words[1];
    const department = words[2];

    // subcase 1: acro <some_acronym> <some_department>
    if (acronym && department) {
      const result = await getByAcronymAndDepartment(acronym, department);
      if (result && result.length > 0) await say(resultText(result));
      else await say(unknownAcro(acronym));
      return;
    }

    // subcase 2: acro <some_acronym>
    if (acronym) {
      const result = await getByAcronym(acronym);
      if (result && result.length > 0) await say(resultText(result));
      else await say(unknownAcro(acronym));
      return;
    }

    // subcase 3: acro
    return await say(showCommands());
  });

  // These will be used in the next two blocks:
  let acronym = null;
  let definition = null;
  let isAdding = false;
  let isUpdating = false;

  // add acri
  app.message(/^(add).*/, async ({ message, say, respond }) => {
    const words = message.text.split(" ");

    acronym = words[1];
    definition = words.slice(2).join(" ");

    if (acronym && definition) {
      await say(promptAddToDepartment());
      isAdding = true;
      return;
    } else await say(incorrectAdd());
  });

  // Update acro
  app.message(/^(update).*/, async ({ message, say }) => {
    const words = message.text.split(" ");

    acronym = words[1];
    definition = words.slice(2).join(" ");

    if (acronym && definition) {
      await say(promptUpdateInDepartment());
      isUpdating = true;
      return;
    } else await say(incorrectUpdate());
  });

  // check follow up after add or update
  app.message(async ({ message, say }) => {
    if (isAdding) {
      if (message.text === "cancel") {
        await say(operationCancelled());
      } else if (message.text === "no") {
        const check = await getByAcronym(acronym);
        if (check.length > 0) {
          await say(acronymExists());
        } else {
          await addAcronym(acronym, "none", definition);
          await say(acronymAdded());
        }
      } else {
        const check = await getByAcronymAndDepartment(acronym, message.text);
        if (check.length > 0) {
          await say(acronymExists(department));
        } else {
          await addAcronym(acronym, message.text, definition);
          await say(acronymAdded());
        }
      }
      acronym = null;
      definition = null;
      isAdding = false;
      return;
    }

    if (isUpdating) {
      if (message.text === "cancel") {
        await say(operationCancelled());
      } else if (message.text === "no") {
        const check = await getByAcronym(acronym);
        if (check.length > 0) {
          await updateAcronym(acronym, definition);
          await say(acronymUpdated());
        } else await say(acronymDoesntExist());
      } else {
        const check = await getByAcronymAndDepartment(acronym, message.text);
        if (check.length > 0) {
          await updateAcronym(acronym, definition, message.text);
          await say(acronymUpdated());
        } else await say(acronymDoesntExist(message.text));
      }
      acronym = null;
      definition = null;
      isUpdating = false;
      return;
    }
  });

  console.log(`⚡️ ACRO app is running!`);
}

run();
