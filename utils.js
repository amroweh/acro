function resultText(result) {
  let definitions = "This acronym may mean: \n";
  result.forEach((el) => {
    console.log(el.department);
    const department =
      el.department !== "none" ? "_(" + el.department + ")_" : "";
    definitions +=
      ":white_small_square: *" + el.definition + "* " + department + "\n";
  });
  return definitions;
}

const Departments = Object.freeze({
  1: "Identity",
  2: "GDP Sports",
  3: "GDP News",
  4: "GDP Platform and Capability",
  5: "DC Labs - Glass Sales and Optimisation",
  6: "DC Labs - Discovery and Sales",
  7: "My Sky App",
  8: "Digital Service",
});

function getDepartmentFromIndex(index) {
  return Departments[index];
}

function departmentList() {
  let departmentsList = "";
  for (let i in Departments) {
    departmentsList += "`" + i + "`" + ": " + Departments[i] + "\n";
  }
  return departmentsList;
}

function unknownAcro(acronym) {
  return (
    ":warning: Unfortunately, we do not know what " +
    acronym +
    " means yet. If you would like to add it or request its meaning, you can use `add <acronym>` or `request <acronym>`"
  );
}

function showCommands() {
  return "The following commands are currently supported:\n`acro <acronym>` (gets acronym definition)\n`acro <acronym> <department>` (gets acronym definition in specific department)\n`define <acronym>` (gets acronym definition)\n`define <acronym> <department>` (gets acronym definition in specific department)\n`add <acronym> <definition>` (adds new acronym)\n`update <acronym> <new_definition>` (updates definition of existing acronym)\n`help` (shows list of supported commands)";
}

function greet() {
  return "Hello from ACRO! This is your helpful bot for all Sky acronyms. To get started, try `acro <acronym>`. For example, `acro CORS`, or `help` for a list of supported commands.";
}

function acronymAdded() {
  return ":white_check_mark: Success. This acronym has been added to our database.";
}

function acronymUpdated() {
  return ":white_check_mark: Success. This acronym has been updated in our database.";
}

function acronymExists(department) {
  const fillText = department
    ? "in the specified department"
    : "in our database";
  return (
    ":warning: This acronym already exists " +
    fillText +
    ". To update it, please use `update <acronym> <new_definition>`."
  );
}

function acronymDoesntExist(department) {
  const fillText = department
    ? "in the specified department"
    : "in our database";
  return (
    ":warning: This acronym does not exist " +
    fillText +
    ". To add it, please use `add <acronym> <definition>`."
  );
}

function operationCancelled() {
  return ":x: This operation has been cancelled.";
}

function invalidDepartment() {
  return ":x: Only the listed indices can be chosen. Aborting...";
}

function promptAddToDepartment() {
  return (
    ":warning: Would you like to add this acronym to a specific department? If so, please enter the number of that department: (enter `no` otherwise, or `cancel` to stop this):\n" +
    departmentList()
  );
}

function promptUpdateInDepartment() {
  return (
    ":warning: Would you like to update this acronym at a specific department? If so, please enter the number of that department: (enter `no` otherwise, or `cancel` to stop this):\n" +
    departmentList()
  );
}

function incorrectAdd() {
  return ":warning: You must use the following syntax to add an acronym: `add <acronym> <definition>`";
}

function incorrectUpdate() {
  return ":warning: You must use the following syntax to update an acronym: `update <acronym> <new_definition>`";
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
  promptAddToDepartment,
  promptUpdateInDepartment,
  getDepartmentFromIndex,
  invalidDepartment,
};
