import { Client } from "pg";
import fs from "fs";

const sql = fs.readFileSync("db-schema.sql", "utf-8");

const client = new Client({ connectionString: "postgresql://postgres:tiger@127.0.0.1:5433/rankershub" });
client.connect()
  .then(() => client.query(sql))
  .then(() => { console.log("Schema applied"); process.exit(0); })
  .catch(err => { console.error(err.message); process.exit(1); });
