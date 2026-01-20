const fs = require("fs");
const path = require("path");
const { db, DB_PATH } = require("./db");

const schemaPath = path.join(__dirname, "../../sql/schema.sql");
const schema = fs.readFileSync(schemaPath, "utf-8");

db.exec(schema);
console.log("✅ Database initialized:", DB_PATH);

process.exit(0);
