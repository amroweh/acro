const sqlite3 = require("sqlite3").verbose();

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
  db.run(sql);
  // Create Table
  console.log("creating table...");
  sql = `CREATE TABLE acronyms(id Integer PRIMARY KEY, acronym, definition, department)`;
  db.run(sql);
  // Add Entries
  let sqlInsert = `INSERT INTO acronyms(acronym, definition, department) VALUES (?,?,?)`;
  const initialValues = [
    ["BAU", "Business As Usual", "none"],
    ["NFT", "Non-functional Test", "none"],
    ["DBA", "Database Administrator(s)", "none"],
    ["SoS", "Scrum of Scrums", "none"],
    ["EVC", "Enhanced Video Conferencing rooms", "none"],
    ["LTS", "Long Term Support", "none"],
    ["JV", "Joint Venture", "none"],
  ];
  initialValues.forEach((value) => {
    db.run(sqlInsert, value, (err) => {
      if (err) console.log(err);
    });
  });
}

// Database functions
async function getAll() {
  let sqlSelect = `SELECT * FROM acronyms`;
  return new Promise((resolve, reject) => {
    db.all(sqlSelect, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

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

module.exports = {
  setupDB,
  getByAcronym,
  getByAcronymAndDepartment,
  addAcronym,
  updateAcronym,
  getAll,
};
