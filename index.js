require("dotenv").config();
const { App } = require("@slack/bolt");
const signingSecret = process.env["SLACK_SIGNING_SECRET"];
const botToken = process.env["SLACK_BOT_TOKEN"];
//const appToken = process.env["SLACK_APP_TOKEN"];
const {
  resultText,
  unknownAcro,
  showCommands,
  greet,
  acronymExists,
  acronymDoesntExist,
  acronymAdded,
  acronymUpdated,
  acronymDeleted,
  operationCancelled,
  incorrectAdd,
  incorrectUpdate,
  promptAddToDepartment,
  promptUpdateInDepartment,
  departmentExists,
  departmentNameInvalid,
  getDepartmentFromIndex,
  invalidDepartment,
} = require("./utils.js");
const {
  setupDB,
  getByAcronym,
  getByAcronymAndDepartment,
  addAcronym,
  deleteAcronym,
  updateAcronym,
  getAll,
} = require("./db_functions.js");

// Initialise the Slack Bot App using the slack bolt api
const app = new App({
  signingSecret: signingSecret,
  token: botToken,
  //appToken: appToken, NOTE: NEED TO CHANGE THIS SINCE I REMOVED THE APP LEVEL TOKEN (I.E. CREATE NEW ONE)
  //socketMode: true,
});

// Run the bot - Includes all possible replies based on what the user inputs
async function run() {
  await app.start(process.env.PORT || 10000);

  app.message(/^(hello|hey|hi|yo)$/, async ({ message, say }) => {
    await say(greet());
  });

  app.message(/^(all)$/, async ({ message, say }) => {
    await say(resultText(await getAll()));
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
  let department = null;
  let isAdding = false;
  let isUpdating = false;

  // add acronym
  app.message(/^(add).*/, async ({ message, say }) => {
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

  // Delete acro
  app.message(/^(delete).*/, async ({ message, say }) => {
    const words = message.text.split(" ");

    acronym = words[1];
    department = words.slice(2).join(" ");

    if (acronym && department) {
      // if department is incorrect, return
      if (!departmentExists(department)) {
        await say(departmentNameInvalid());
        return;
      }
      // if acronym doesn't exist, return, else delete it
      const check = await getByAcronymAndDepartment(acronym, department);
      if (check.length > 0) {
        await deleteAcronym(acronym, department);
        await say(acronymDeleted());
      } else await say(acronymDoesntExist(department));
      return;
    } else await say(incorrectUpdate());

    // if(acronym){
    //   await say(promptUpdateInDepartment());
    //   isUpdating = true;
    //   return;
    // }
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
        const department = getDepartmentFromIndex(message.text);
        if (!department) await say(invalidDepartment());
        else {
          const check = await getByAcronymAndDepartment(acronym, department);
          if (check.length > 0) {
            await say(acronymExists(department));
          } else {
            await addAcronym(acronym, department, definition);
            await say(acronymAdded());
          }
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
        const department = getDepartmentFromIndex(message.text);
        if (!department) await say(invalidDepartment());
        else {
          const check = await getByAcronymAndDepartment(acronym, department);
          if (check.length > 0) {
            await updateAcronym(acronym, definition, department);
            await say(acronymUpdated());
          } else await say(acronymDoesntExist(department));
        }
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
