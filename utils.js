function resultText(result) {
  let definitions = "This acronym may mean: \n";
  result.forEach(
    (el) => (definitions += "- " + el.definition + " (" + el.department + ")\n")
  );
  return definitions;
}

function unknownAcro(acronym) {
  return "Unfortunately, we do not know what ${acronym} means yet. If you would like to add it or request its meaning, you can use `add <acronym>` or `request <acronym>`";
}

function showCommands() {
  return "The following commands are currently supported:\n`acro <acronym>` (gets acronym definition)\n`acro <acronym> <department>` (gets acronym definition in specific department)\n`define <acronym>` (gets acronym definition)\n`define <acronym> <department>` (gets acronym definition in specific department)\n`add <acronym> <definition>` (adds new acronym)\n`update <acronym> <new_definition>` (updates definition of existing acronym)\n`help` (shows list of supported commands)";
}

function greet() {
  return "Hello from ACRO! This is your helpful bot for all Sky acronyms. To get started, try `acro <acronym>`. For example, `acro CORS`, or `help` for a list of supported commands.";
}

function acronymAdded() {
  return "Success. This acronym has been added to our database.";
}

function acronymUpdated() {
  return "Success. This acronym has been updated in our database.";
}

function acronymExists(department) {
  const fillText = department
    ? "in the specified department"
    : "in our database";
  return (
    "This acronym already exists " +
    fillText +
    ". To update it, please use `update <acronym> <new_definition>`."
  );
}

function acronymDoesntExist(department) {
  const fillText = department
    ? "in the specified department"
    : "in our database";
  return (
    "This acronym does not exist " +
    fillText +
    ". To add it, please use `add <acronym> <definition>`."
  );
}

function operationCancelled() {
  return "This operation has been cancelled.";
}

function promptAddToDepartment() {
  return "Would you like to add this acronym to a specific department? If so, please type in the department name and press enter (type no otherwise, or cancel to stop this):";
}

function promptUpdateInDepartment() {
  return "Would you like to update this acronym at a specific department? If so, please type in the department name and press enter (type no otherwise, or cancel to stop this):";
}

function incorrectAdd() {
  return "You must use the following syntax to add an acronym: `add <acronym> <definition>`";
}

function incorrectUpdate() {
  return "You must use the following syntax to update an acronym: `update <acronym> <new_definition>`";
}

module.exports = {
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
};
