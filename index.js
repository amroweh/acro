require("dotenv").config();

const sqlite3 = require("sqlite3").verbose();
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

async function addAcronym(acronym, department, definition) {
  let sqlInsert = `INSERT INTO acronyms (acronym, department, definition) SELECT '${acronym}', '${department}', '${definition}' WHERE NOT EXISTS (SELECT acronym, department FROM acronyms WHERE acronym='${acronym}' AND department='${department}')`;
  return new Promise((resolve, reject) => {
    db.run(sqlInsert, [], (err) => {
      if (err) reject(err);
      else resolve("data successfully added into database");
    });
  });
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
  // app.message(/^/, async ({message, say}) => {
  //   await say(showCommands())
  // })

  // These will be used in the next two blocks:
  let acronym = null;
  let definition = null;
  let isAdding = false;

  app.message(/^(add).*/, async ({ message, say, respond }) => {
    const words = message.text.split(" ");

    acronym = words[1];
    definition = words.slice(2).join(" ");

    console.log("acronym:" + acronym);
    console.log("definition:" + definition);

    if (acronym && definition) {
      await say(
        "Would you like to add this acronym to a specific department? If so, please type in the department name and press enter (type no otherwise, or cancel to stop this):"
      );
      isAdding = true;
      return;
    } else
      await say(
        "You must use the following syntax to add an acronym: add <acronym> <definition>"
      );
  });

  app.message(async ({ message, say }) => {
    if (isAdding) {
      if (message.text === "cancel") {
        await say("This operation has been cancelled.");
      } else if (message.text === "no") {
        await addAcronym(acronym, "none", definition);
        await say(
          "Thank you for adding this acronym! This has now been registered in our database"
        );
      } else {
        await addAcronym(acronym, message.text, definition);
        await say(
          "Thank you for adding this acronym! This has now been registered in our database"
        );
      }
      acronym = null;
      definition = null;
      isAdding = false;
    }
  });

  console.log(`⚡️ ACRO app is running!`);
}

run();
